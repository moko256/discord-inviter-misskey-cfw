import { Config } from './config_entities';

export interface ConfigRepository {
	getConfig(): Config;
}
