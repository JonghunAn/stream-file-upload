import { GDBResponse } from '../../../common/interface/gdb-response.interface';

export interface ITopicRepository {
  createTopic(
    topicDID: string,
    subDID: string,
    userDID: string,
    requestId: string,
    data: string
  ): Promise<GDBResponse<{ topicDID: string }>>;
}
