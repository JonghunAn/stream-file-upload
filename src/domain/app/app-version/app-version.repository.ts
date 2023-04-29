import { Injectable } from '@nestjs/common';
import { GraphService } from '../../../shared/graph-database/graph-database.service';
import { AppInfo } from '../entity/app-info.entity';
import { GDBResponse } from '../../../common/interface/gdb-response.interface';
import { IAppVersionRepository } from './interface/app-version.repository.interface';

@Injectable()
export class AppVersionRepository implements IAppVersionRepository {
  constructor(private readonly graphService: GraphService) {}

  static gremlinScriptFindAll = `
  def androidInfos
  def iosInfos
  def androidInfosCount = g.V().has('A','A_aV',gte(0)).has('A_pT', 'ANDROID').count().next()
  def iosInfosCount = g.V().has('A','A_aV',gte(0)).has('A_pT', 'IOS').count().next()
  if (androidInfosCount == 0) {
    androidInfos = []
  } else {
    androidInfos = g.V().has('A','A_aV',gte(0)).has('A_pT', 'ANDROID')
              .order().by('A_aV',desc)
              .unfold()
              .project('version', 'secret', 'platformType')
              .by(values('A_aV'))
              .by(values('A_aS'))
              .by(values('A_pT'))
              .fold().next()
  }
  
  if(iosInfosCount == 0) {
    iosInfos = []
  } else {
    iosInfos = g.V().has('A','A_aV',gte(0)).has('A_pT', 'IOS')
              .order().by('A_aV',desc)
              .unfold()
              .project('version', 'secret', 'platformType')
              .by(values('A_aV'))
              .by(values('A_aS'))
              .by(values('A_pT'))
              .fold().next()
  }
  return [[code:'OK', response:[androidInfos: androidInfos, iosInfos: iosInfos]]]
  `;
  async findAll(): Promise<GDBResponse<{ androidInfos: AppInfo[]; iosInfos: AppInfo[] }>> {
    return await this.graphService.submitHttpGremlinScript(AppVersionRepository.gremlinScriptFindAll, {});
  }
}
