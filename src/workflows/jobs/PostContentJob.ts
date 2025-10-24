import { Job, JobHandler, JobResult, JobType } from '../types';
import { connectorRegistry } from '../../connectors/base';
import { SocialConnector, PostData } from '../../connectors/base/SocialConnector';

interface PostContentJobData {
  connectorId: string;
  postData: PostData;
}

export class PostContentJobHandler implements JobHandler<PostContentJobData> {
  async handle(job: Job<PostContentJobData>): Promise<JobResult> {
    const { connectorId, postData } = job.data;

    try {
      const connector = connectorRegistry.getActiveConnector(connectorId);

      if (!connector) {
        return {
          success: false,
          error: `Connector ${connectorId} not found or not connected`,
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

      const result = await connector.post(postData);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Post failed',
          shouldRetry: true
        };
      }

      return {
        success: true,
        data: {
          postId: result.postId,
          url: result.url,
          platformResponse: result.platformResponse
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

  async onSuccess(job: Job<PostContentJobData>, result: JobResult): Promise<void> {
    console.log(`Post job ${job.id} completed successfully:`, result.data);
  }

  async onFailure(job: Job<PostContentJobData>, error: Error): Promise<void> {
    console.error(`Post job ${job.id} failed after ${job.attempts} attempts:`, error);
  }
}
