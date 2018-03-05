import {ScriptRunner} from './script-runner';
import {Script} from '../script';
import {Project} from '../project';
import {EnvList} from '../environment-variable';


export class ParallelScriptRunner extends ScriptRunner
{


	protected async doRunScript(projects: Array<Project>, script: Script, inputAnswers: EnvList, dry: boolean): Promise<number>
	{
		let totalSize = projects.length;
		let returnCode = 0;
		let finished = 0;

		return new Promise<number>((resolve) => {
			function finish(code: number)
			{
				finished++;

				if (code > 0) {
					returnCode = code;
				}

				if (finished === totalSize) {
					resolve(returnCode);
				}
			}

			for (let i = 0; i < projects.length; i++) {
				this.runProjectScript(projects[i], script, inputAnswers, dry).then(finish);
			}
		});
	}

}
