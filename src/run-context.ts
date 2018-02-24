import {Project} from './project';
import {EnvList} from './environment-variable';


export class RunContext
{


	public readonly project: Project;

	public readonly env: EnvList;

	public readonly inputs: EnvList;


	constructor(project: Project, env: EnvList = {}, inputs: EnvList = {})
	{
		this.project = project;
		this.env = env;
		this.inputs = inputs;
	}

}
