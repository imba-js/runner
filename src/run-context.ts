import {Project} from './project';
import {EnvList} from './environment-variable';


export enum RunState
{
	PrintInfo,
	Run,
}


export class RunContext
{


	public readonly state: RunState;

	public readonly project: Project;

	public readonly env: EnvList;

	public readonly inputs: EnvList;


	constructor(state: RunState, project: Project, env: EnvList = {}, inputs: EnvList = {})
	{
		this.state = state;
		this.project = project;
		this.env = env;
		this.inputs = inputs;
	}

}
