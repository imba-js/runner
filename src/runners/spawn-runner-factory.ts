import {RunnerFactory} from './runner-factory';
import {Runner} from './runner';
import {SpawnRunner} from './spawn-runner';
import {CommandEnvList} from '../command';


export class SpawnRunnerFactory implements RunnerFactory
{


	public createRunner(root: string, command: string, environment: CommandEnvList): Runner
	{
		return new SpawnRunner(root, command, environment);
	}

}
