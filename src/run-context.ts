import {Project} from './project';
import {EnvList} from './environment-variable';


export class RunContext
{


	public readonly project: Project;

	public readonly env: EnvList;

	public readonly scriptReturnCode: number|undefined;

}
