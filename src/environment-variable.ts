import * as _ from 'lodash';


export declare interface EnvList
{
	[name: string]: string,
}


export function createScriptEnvironment(scriptEnv: Array<EnvironmentVariable> = [], inputAnswers: EnvList = {}, append: EnvList = {}): EnvList
{
	const environment: EnvList = {};

	for (let i = 0; i < scriptEnv.length; i++) {
		environment[scriptEnv[i].name] = scriptEnv[i].value;
	}

	const env: EnvList = _.merge(_.clone(environment), inputAnswers, append);

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
