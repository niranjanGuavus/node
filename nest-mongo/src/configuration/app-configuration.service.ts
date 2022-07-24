import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigurationService {
  private readonly _connectionString!: string;

  get connectionString(): string {
    return this._connectionString;
  }

  constructor(private readonly _configService: ConfigService) {
    this._connectionString = this._getConnectionStringFromEnvFile();
  }

  private _getConnectionStringFromEnvFile(): string {
    const host: string = this._configService.get<string>('db.mongo.host');
    const port: number = this._configService.get<number>('db.mongo.port');
    const database: string = this._configService.get<string>('db.mongo.database');
    const userName: string = encodeURIComponent(this._configService.get<string>('db.mongo.userName'));
    const password: string = encodeURIComponent(this._configService.get<string>('db.mongo.password'));
    const connectionString = `mongodb://${userName}:${password}@${host}:${port}/${database}`;
    if (!connectionString) {
      throw new Error('No connection string has been provided in the .yaml file.');
    }
    console.log(connectionString);
    return connectionString;
  }
}
