import {RunnerFactory} from './runner-factory';
import {Runner} from './runner';
import {SpawnRunner} from './spawn-runner';
import {EnvList} from '../environment-variable';


export class SpawnRunnerFactory implements RunnerFactory
{


	public createRunner(root: string, command: string, environment: EnvList): Runner
	{
		return new SpawnRunner(root, command, environment);
	}

}
