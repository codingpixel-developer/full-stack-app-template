import { Module } from '@nestjs/common';
import { QueueModule } from './queue/queue.module';
// cfsa:imports

@Module({
  imports: [
    QueueModule,
    // cfsa:modules
  ],
  providers: [
    // cfsa:providers
  ],
})
export class AppModule {}
