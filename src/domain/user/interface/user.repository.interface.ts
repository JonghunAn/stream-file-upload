import { User } from 'src/domain/user/entity/user.entity';
import { GDBResponse } from '../../../common/interface/gdb-response.interface';

export interface IUserRepository {
  createUser(
    userDID: string,
    socketAddress: string,
    pushToken?: string,
    pushTokenType?: string
  ): Promise<GDBResponse<{ user: User }>>;

  existsByUserConnectedTopic(userDID: string, subDID: string, topicDID: string): Promise<GDBResponse<boolean>>;
}
