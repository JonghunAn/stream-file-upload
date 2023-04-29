import { Injectable } from '@nestjs/common';
import { GraphService } from '../../shared/graph-database/graph-database.service';
import { IUserRepository } from './interface/user.repository.interface';
import { User } from 'src/domain/user/entity/user.entity';
import { GDBResponse } from '../../common/interface/gdb-response.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private graphService: GraphService) {}
  static gremlinScriptCreateUser = `
  def tr = g.V().has('U_did',userDID)
  
  if (tr.hasNext()) {
      return [[code:'UV_EXISTING_ENTRY', error:'User with did ' + userDID + ' already exists']]
  }

  def uV = graph.addVertex('U')
  uV.property('U_did',userDID)
  uV.property('U_plT','F')

  if (binding.hasVariable('socketAddress')) { 
    uV.property('U_wsS',socketAddress)
  }  
  if (binding.hasVariable('pushTokenType')) { 
    uV.property('U_pP',pushTokenType)
  }  
  if (binding.hasVariable('pushToken')) {
    uV.property('U_pT',pushToken)
  }  
  graph.tx().commit()

  tr = g.V().has('U','U_did',userDID)
  def user = tr.project('userDID','pushTokenType','pushToken','socketAddress')
          .by(values('U_did'))
          .by(values('U_pP'))
          .by(values('U_pT'))
          .by(values('U_wsS'))
          .next()

  return [[code:'OK', response:[user:user]]]
  `;
  static gremlinScriptCreateUserStoredProcedure = `User.createUser(graph,g,userDID,pushTokenType,pushToken,pushNotiSnsEndpoint,socketAddress)`;
  async createUser(
    userDID: string,
    socketAddress: string,
    pushToken?: string,
    pushTokenType?: string
  ): Promise<GDBResponse<{ user: User }>> {
    return await this.graphService.submitHttpGremlinScript(UserRepository.gremlinScriptCreateUser, {
      userDID,
      pushToken,
      pushTokenType,
      socketAddress,
    });
  }

  static gremlinScriptExistsByUserConnectedTopic = `
  def tr = g.V().has('U_did', userDID).outE().has('sb_did', subDID).inV().has('T_did', topicDID)
  if(tr.hasNext()) {
        return[[code:'OK', response:true]]
    }
    return[[code:'OK', response:false]]
`;
  async existsByUserConnectedTopic(userDID: string, subDID: string, topicDID: string): Promise<GDBResponse<boolean>> {
    return await this.graphService.submitHttpGremlinScript(UserRepository.gremlinScriptExistsByUserConnectedTopic, {
      userDID,
      subDID,
      topicDID,
    });
  }

  static gremlinScriptGetTopicUserCount = `
  def count = g.V().has('I_c', invitationCode).inE().hasLabel('tiv').outV().hasLabel('T').inE().hasLabel('sb').count().next()
  return [[code:'OK', response:count]]
  `;
  async getTopicUserCount(invitationCode: string): Promise<GDBResponse<number>> {
    return await this.graphService.submitHttpGremlinScript(UserRepository.gremlinScriptGetTopicUserCount, {
      invitationCode,
    });
  }
}
