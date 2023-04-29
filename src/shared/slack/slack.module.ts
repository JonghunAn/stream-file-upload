import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SlackService } from './slack.service';

@Module({
  imports: [HttpModule],
  providers: [{ provide: SlackService.name, useClass: SlackService }],
  exports: [{ provide: SlackService.name, useClass: SlackService }],
})
export class SlackModule {}
