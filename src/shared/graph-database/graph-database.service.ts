import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as gremlin from 'gremlin';
import { lastValueFrom, map } from 'rxjs';
import { ConfigData } from 'src/common/constant/config-data.enum';
import { getConfigData } from 'src/common/util/config.util';

export const mapToObject: any = (map = new Map()) => {
  if (!(map instanceof Map)) return map;
  return Object.fromEntries(
    Array.from(map.entries(), ([k, v]) => {
      if (v instanceof Array) {
        return [k, v.map(mapToObject)];
      } else if (v instanceof Map) {
        return [k, mapToObject(v)];
      } else {
        return [k, v];
      }
    })
  );
};

@Injectable()
export class GraphService {
  private reader: gremlin.structure.io.GraphSONReader;

  constructor(private readonly httpService: HttpService) {
    this.reader = new gremlin.structure.io.GraphSONReader();
  }

  async submitHttpGremlinScript(gremlin: string, bindings: Record<string, unknown>): Promise<any> {
    return await lastValueFrom(
      this.httpService
        .post(
          getConfigData(ConfigData.GDB_HTTP_ENDPOINT),
          {
            gremlin,
            bindings: { ...bindings },
          },
          {
            auth: {
              username: getConfigData(ConfigData.GRAPH_SERVER_CONNECTION_USERNAME),
              password: getConfigData(ConfigData.GRAPH_SERVER_CONNECTION_PASSWORD),
            },
            timeout: 3000,
          }
        )
        .pipe(
          map(res => {
            return mapToObject(this.reader.read(res.data).result.data[0]);
          })
        )
    );
  }
}
