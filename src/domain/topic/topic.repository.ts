import { Injectable } from '@nestjs/common';
import { GDBResponse } from 'src/common/interface/gdb-response.interface';
import { GraphService } from '../../shared/graph-database/graph-database.service';
import { ITopicRepository } from './interface/topic.repository.interface';
import { genStoredProcedure } from 'src/common/util/util';

@Injectable()
export class TopicRepository implements ITopicRepository {
  constructor(private graphService: GraphService) {}
  async createTopic(
    topicDID: string,
    subDID: string,
    userDID: string,
    requestId: string,
    data: string
  ): Promise<GDBResponse<{ topicDID: string }>> {
    return await this.graphService.submitHttpGremlinScript(
      genStoredProcedure(this.createTopic.toString(), this.createTopic.name),
      {
        topicDID,
        subDID,
        userDID,
        requestId,
        data,
      }
    );
  }
}
