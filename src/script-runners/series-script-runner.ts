import {ScriptRunner} from './script-runner';
import {Script} from '../script';
import {Project} from '../project';
import {EnvList} from '../environment-variable';


export class SeriesScriptRunner extends ScriptRunner
{


	protected async doRunScript(projects: Array<Project>, script: Script, inputAnswers: EnvList, dry: boolean): Promise<number>
	{
		let returnCode = 0;

		for (let i = 0; i < projects.length; i++) {
			const currentReturnCode = await this.runProjectScript(projects[i], script, inputAnswers, dry);

			if (currentReturnCode > 0) {
				returnCode = currentReturnCode;
			}
		}

		return returnCode;
	}

}
