import {CommandEnvList} from './command';
import * as _ from 'lodash';


export function createScriptEnvironment(scriptEnv: Array<EnvironmentVariable> = [], inputAnswers: CommandEnvList = {}, append: CommandEnvList = {}): CommandEnvList
{
	const environment: CommandEnvList = {};

	for (let i = 0; i < scriptEnv.length; i++) {
		environment[scriptEnv[i].name] = scriptEnv[i].value;
	}

	const env: CommandEnvList = _.merge(_.clone(environment), inputAnswers, append);

	if (!_.isUndefined(process.env.PATH)) {
		env.PATH = process.env.PATH;
	}

	return env;
}


export class EnvironmentVariable
{


	public readonly name: string;

	public readonly value: string;


	constructor(name: string, value: string)
	{
		this.name = name;
		this.value = value;
	}

}
