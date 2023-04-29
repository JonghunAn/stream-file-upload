import { Injectable } from '@nestjs/common';
import { GraphService } from '../../../shared/graph-database/graph-database.service';
import { GDBResponse } from '../../../common/interface/gdb-response.interface';
import { PlatformType } from '../entity/app-info.entity';
import { IAppPolicyRepository } from './interface/app-policy.repository.interface';

@Injectable()
export class AppPolicyRepository implements IAppPolicyRepository {
  constructor(private readonly graphService: GraphService) {}

  static gremlinScriptGetCurrAppPolicy = `
  def isPolicy = g.V().has('P','P_n',1).hasNext()
  
  if (!isPolicy) { 
    def pV = graph.addVertex('P')
    pV.property('P_n',1)
    pV.property('P_iR', false)
    pV.property('P_aR', false)
    pV.property('P_iS', '')
    pV.property('P_aS', '')
  }  
  graph.tx().commit()

  def policy = g.V().has('P','P_n',1).next()
  def iosIsCurrVerRcmd = policy.values('P_iR').hasNext() ? policy.values('P_iR').next() : false 
  def androidIsCurrVerRcmd = policy.values('P_aR').hasNext() ? policy.values('P_aR').next() : false
  def iosStrRedUrl = policy.values('P_iS').hasNext() ? policy.values('P_iS').next() : ''
  def androidStrRedUrl = policy.values('P_aS').hasNext() ? policy.values('P_aS').next() : ''
  return [[code:'OK', response:[iosInfo:[isCurrVerRecommended:iosIsCurrVerRcmd, storeRedirectUrl:iosStrRedUrl], androidInfo:[isCurrVerRecommended:androidIsCurrVerRcmd, storeRedirectUrl:androidStrRedUrl]]]]
  `;
  async getCurrentAppPolicy(): Promise<
    GDBResponse<{
      iosInfo: { isCurrVerRecommended: boolean; storeRedirectUrl: string };
      androidInfo: { isCurrVerRecommended: boolean; storeRedirectUrl: string };
    }>
  > {
    const res = await this.graphService.submitHttpGremlinScript(AppPolicyRepository.gremlinScriptGetCurrAppPolicy, {});
    return res;
  }

  static gremlinScriptSetCurrAppPolicy = `
  def isPolicy = g.V().has('P','P_n',1).hasNext()
  
  if (!isPolicy) { 
    def pV = graph.addVertex('P')
    pV.property('P_n',1)
    pV.property('P_iR', false)
    pV.property('P_aR', false)
    pV.property('P_iS', '')
    pV.property('P_aS', '')
  }  

  def policy = g.V().has('P','P_n',1).next()

  if (platformType == 'IOS') {
    if (isCurrVerRecommended) {
      policy.property('P_iR', isCurrVerRecommended)
    }
    if (storeRedirectUrl) {
      policy.property('P_iS', storeRedirectUrl)
    }
  } else {
    if (isCurrVerRecommended) {
      policy.property('P_aR', isCurrVerRecommended)
    }
    if (storeRedirectUrl) {
      policy.property('P_aS', storeRedirectUrl)
    }
  }
  
  graph.tx().commit()
  return [[code:'OK', response:[isSet:true]]]
  `;
  async setCurrentAppPolicy(
    platformType: PlatformType,
    option: { isCurrVerRecommended?: boolean; storeRedirectUrl?: string }
  ): Promise<GDBResponse<{ isSet: boolean }>> {
    const { isCurrVerRecommended, storeRedirectUrl } = option;
    return await this.graphService.submitHttpGremlinScript(AppPolicyRepository.gremlinScriptSetCurrAppPolicy, {
      platformType,
      isCurrVerRecommended,
      storeRedirectUrl,
    });
  }
}
