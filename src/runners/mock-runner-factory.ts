import {RunnerFactory} from './runner-factory';
import {Runner} from './runner';
import {MockRunner} from './mock-runner';
import {CommandEnvList} from '../command';
import * as _ from 'lodash';


export class MockRunnerFactory implements RunnerFactory
{


	public commands: {[cmd: string]: (runner: MockRunner) => void} = {};


	public createRunner(root: string, command: string, environment: CommandEnvList): Runner
	{
		const runner = new MockRunner(root, command, environment);

		if (!_.isUndefined(this.commands[command])) {
			this.commands[command](runner);
		}

		return runner;
	}

}
