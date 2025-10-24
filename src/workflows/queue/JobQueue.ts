import { Job, JobStatus, JobPriority, JobResult, JobHandler, JobType } from '../types';

export class JobQueue {
  private static instance: JobQueue;
  private queue: Job[] = [];
  private handlers: Map<JobType, JobHandler> = new Map();
  private processing: Map<string, Promise<void>> = new Map();
  private maxConcurrent: number = 5;
  private activeJobs: number = 0;

  private constructor() {
    this.startProcessing();
  }

  static getInstance(): JobQueue {
    if (!JobQueue.instance) {
      JobQueue.instance = new JobQueue();
    }
    return JobQueue.instance;
  }

  registerHandler(type: JobType, handler: JobHandler): void {
    this.handlers.set(type, handler);
  }

  async addJob<T>(
    type: JobType,
    data: T,
    options: {
      userId: string;
      connectorId?: string;
      priority?: JobPriority;
      scheduledFor?: Date;
      maxAttempts?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<Job<T>> {
    const job: Job<T> = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      status: JobStatus.PENDING,
      priority: options.priority || JobPriority.NORMAL,
      data,
      userId: options.userId,
      connectorId: options.connectorId,
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      scheduledFor: options.scheduledFor,
      metadata: options.metadata
    };

    this.queue.push(job);
    this.sortQueue();
    return job;
  }

  async getJob(jobId: string): Promise<Job | undefined> {
    return this.queue.find(job => job.id === jobId);
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.queue.find(job => job.id === jobId);
    if (!job) return false;

    if (job.status === JobStatus.PROCESSING) {
      return false;
    }

    job.status = JobStatus.CANCELLED;
    job.updatedAt = new Date();
    this.removeFromQueue(jobId);
    return true;
  }

  async getJobsByUser(userId: string): Promise<Job[]> {
    return this.queue.filter(job => job.userId === userId);
  }

  async getJobsByStatus(status: JobStatus): Promise<Job[]> {
    return this.queue.filter(job => job.status === status);
  }

  private sortQueue(): void {
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  private async startProcessing(): Promise<void> {
    setInterval(() => {
      this.processNextJobs();
    }, 1000);
  }

  private async processNextJobs(): Promise<void> {
    while (this.activeJobs < this.maxConcurrent) {
      const job = this.getNextJob();
      if (!job) break;

      this.processJob(job);
    }
  }

  private getNextJob(): Job | undefined {
    const now = new Date();
    return this.queue.find(
      job =>
        job.status === JobStatus.PENDING &&
        (!job.scheduledFor || job.scheduledFor <= now) &&
        !this.processing.has(job.id)
    );
  }

  private async processJob(job: Job): Promise<void> {
    const handler = this.handlers.get(job.type);
    if (!handler) {
      console.error(`No handler registered for job type: ${job.type}`);
      job.status = JobStatus.FAILED;
      job.error = `No handler registered for job type: ${job.type}`;
      return;
    }

    job.status = JobStatus.PROCESSING;
    job.startedAt = new Date();
    job.updatedAt = new Date();
    job.attempts++;
    this.activeJobs++;

    const processingPromise = (async () => {
      try {
        const result = await handler.handle(job);

        if (result.success) {
          job.status = JobStatus.COMPLETED;
          job.completedAt = new Date();
          job.result = result.data;

          if (handler.onSuccess) {
            await handler.onSuccess(job, result);
          }

          this.removeFromQueue(job.id);
        } else {
          await this.handleJobFailure(job, new Error(result.error || 'Job failed'), result.shouldRetry);
        }
      } catch (error) {
        await this.handleJobFailure(job, error as Error, true);
      } finally {
        this.activeJobs--;
        this.processing.delete(job.id);
      }
    })();

    this.processing.set(job.id, processingPromise);
  }

  private async handleJobFailure(job: Job, error: Error, shouldRetry: boolean = true): Promise<void> {
    job.error = error.message;
    job.updatedAt = new Date();

    if (shouldRetry && job.attempts < job.maxAttempts) {
      job.status = JobStatus.RETRYING;
      job.scheduledFor = new Date(Date.now() + Math.pow(2, job.attempts) * 1000);
    } else {
      job.status = JobStatus.FAILED;
      job.completedAt = new Date();

      const handler = this.handlers.get(job.type);
      if (handler?.onFailure) {
        await handler.onFailure(job, error);
      }

      this.removeFromQueue(job.id);
    }
  }

  private removeFromQueue(jobId: string): void {
    const index = this.queue.findIndex(job => job.id === jobId);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  getQueueStats(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    active: number;
  } {
    return {
      total: this.queue.length,
      pending: this.queue.filter(j => j.status === JobStatus.PENDING).length,
      processing: this.queue.filter(j => j.status === JobStatus.PROCESSING).length,
      completed: this.queue.filter(j => j.status === JobStatus.COMPLETED).length,
      failed: this.queue.filter(j => j.status === JobStatus.FAILED).length,
      active: this.activeJobs
    };
  }
}

export const jobQueue = JobQueue.getInstance();
