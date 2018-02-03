import {ImbaProjectScriptListConfiguration} from '../definitions';
import {ScriptRunner} from './script-runner';
import * as _ from 'lodash';


export class ParallelScriptRunner extends ScriptRunner
{


	protected async doRunScript(projects: ImbaProjectScriptListConfiguration): Promise<number>
	{
		let totalSize = _.size(projects);
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

			for (let name in projects) {
				if (projects.hasOwnProperty(name)) {
					this.runProjectScript(projects[name]).then(finish);
				}
			}
		});
	}

}
