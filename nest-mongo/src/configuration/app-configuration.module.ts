import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppConfigurationService } from './app-configuration.service';
import configuration from './configuration';

@Module({
  exports: [AppConfigurationService],
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
  ],
  providers: [AppConfigurationService],
})
export class AppConfigurationModule {}
