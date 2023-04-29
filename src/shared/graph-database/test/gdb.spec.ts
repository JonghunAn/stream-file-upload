import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { randomBytes } from 'crypto';
import { AppModule } from '../../../app.module';
import { GraphService } from '../../graph-database/graph-database.service';

describe('App WebSocket Gateway (e2e)', () => {
  let app: INestApplication;
  const userVertexCount = 1;
  let graphService: GraphService;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    const app = moduleFixture.createNestApplication();
    await app.init();
    graphService = app.get(GraphService);

    //clears database
    graphService.submitHttpGremlinScript(
      `
    g.E().drop()
    g.V().drop()
    g.tx().commit()
    return `,
      {}
    );

    app.close();
  });
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    graphService = app.get(GraphService);
  });
  afterEach(() => {
    app.close();
  });

  it(
    `Creates ${userVertexCount} users`,

    async () => {
      for (let i = 0; i < userVertexCount + 1; i++) {
        const rb = Buffer.from(randomBytes(32)).toString('base64url');

        if (i % 1000 === 0) {
          console.log(i);
        }
        await graphService.submitHttpGremlinScript(
          `
          def user = g.addV('T').property('T_did',rb).next()
          graph.tx().commit();
          return
    `,
          { rb }
        );
      }

      const count = await graphService.submitHttpGremlinScript(
        `
        g.V().hasLabel('T').count()
        `,
        {}
      );
      console.log(count);
    },
    1000 * 60 * 12
  );
});
