import {RunnerFactory} from './runner-factory';
import {Runner} from './runner';
import {SpawnRunner} from './spawn-runner';
import {ImbaEnvironmentScriptConfiguration} from '../definitions';


export class SpawnRunnerFactory implements RunnerFactory
{


	public createRunner(root: string, command: string, environment: ImbaEnvironmentScriptConfiguration): Runner
	{
		return new SpawnRunner(root, command, environment);
	}

}
