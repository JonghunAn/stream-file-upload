import { AppInfo } from '../../entity/app-info.entity';
import { GDBResponse } from '../../../../common/interface/gdb-response.interface';

export interface IAppVersionRepository {
  findAll(): Promise<GDBResponse<{ androidInfos: AppInfo[]; iosInfos: AppInfo[] }>>;
}
