import { Job, JobHandler, JobResult } from '../types';
import { connectorRegistry } from '../../connectors/base';
import { SocialConnector } from '../../connectors/base/SocialConnector';

interface FetchMetricsJobData {
  connectorId: string;
  postId?: string;
}

export class FetchMetricsJobHandler implements JobHandler<FetchMetricsJobData> {
  async handle(job: Job<FetchMetricsJobData>): Promise<JobResult> {
    const { connectorId, postId } = job.data;

    try {
      const connector = connectorRegistry.getActiveConnector(connectorId);

      if (!connector) {
        return {
          success: false,
          error: `Connector ${connectorId} not found`,
          shouldRetry: false
        };
      }

      if (!(connector instanceof SocialConnector)) {
        return {
          success: false,
          error: `Connector ${connectorId} is not a social connector`,
          shouldRetry: false
        };
      }

      if (!connector.isConnected()) {
        return {
          success: false,
          error: `Connector ${connectorId} is not connected`,
          shouldRetry: true
        };
      }

      let metrics;
      if (postId) {
        metrics = await connector.getPostMetrics(postId);
      } else {
        metrics = await connector.getMetrics();
      }

      return {
        success: true,
        data: {
          connectorId,
          postId,
          metrics,
          fetchedAt: new Date()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        shouldRetry: true
      };
    }
  }

  async onSuccess(job: Job<FetchMetricsJobData>, result: JobResult): Promise<void> {
    console.log(`Metrics fetch job ${job.id} completed:`, result.data);
  }

  async onFailure(job: Job<FetchMetricsJobData>, error: Error): Promise<void> {
    console.error(`Metrics fetch job ${job.id} failed:`, error);
  }
}
