import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { GraphService } from './graph-database.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [GraphService],
  exports: [GraphService],
})
export class GraphDatabaseModule {}
