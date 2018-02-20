import {RunnerFactory} from './runner-factory';
import {Runner} from './runner';
import {MockRunner} from './mock-runner';
import {EnvList} from '../environment-variable';
import * as _ from 'lodash';


export class MockRunnerFactory implements RunnerFactory
{


	public commands: {[cmd: string]: (runner: MockRunner) => void} = {};


	public createRunner(root: string, command: string, environment: EnvList): Runner
	{
		const runner = new MockRunner(root, command, environment);

		if (!_.isUndefined(this.commands[command])) {
			this.commands[command](runner);
		}

		return runner;
	}

}
