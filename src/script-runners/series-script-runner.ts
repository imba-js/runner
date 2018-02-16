import {ScriptRunner} from './script-runner';
import {Script} from '../script';
import {Project} from '../project';
import {CommandEnvList} from '../command';


export class SeriesScriptRunner extends ScriptRunner
{


	protected async doRunScript(projects: Array<Project>, script: Script, inputAnswers: CommandEnvList): Promise<number>
	{
		let returnCode = 0;

		for (let i = 0; i < projects.length; i++) {
			const currentReturnCode = await this.runProjectScript(projects[i], script, inputAnswers);

			if (currentReturnCode > 0) {
				returnCode = currentReturnCode;
			}
		}

		return returnCode;
	}

}
