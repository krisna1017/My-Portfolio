import { Module } from '@nestjs/common';
import { UploadController, UploadsController } from './uploads.controller';

@Module({
  controllers: [UploadController, UploadsController],
})
export class UploadsModule {}
