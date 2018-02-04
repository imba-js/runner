import {ScriptPrinter} from './script-printer';
import {ScriptRunner, ScriptCommandStartArg, ScriptCommandOutputArg} from '../script-runners';
import {ImbaProjectScriptConfiguration} from '../definitions';
import chalk from 'chalk';


export class SeriesScriptPrinter extends ScriptPrinter
{


	public enablePrinter(runner: ScriptRunner): void
	{
		let projectsCount = 0;

		runner.addListener('projectStart', (scriptProject: ImbaProjectScriptConfiguration) => {
			if (projectsCount) {
				this.output.log('');
			}

			this.output.log(chalk.bold.blue(`Running ${scriptProject.parentScript.name} on ${scriptProject.project.name}`));
			this.printSeparator();

			projectsCount++;
		});

		runner.addListener('commandRun', (command: ScriptCommandStartArg) => {
			this.output.log(chalk.magenta(` - ${command.command}`));
		});

		runner.addListener('commandStdout', (output: ScriptCommandOutputArg) => {
			this.output.stdout(output.chunk);
		});

		runner.addListener('commandStderr', (output: ScriptCommandOutputArg) => {
			this.output.stderr(output.chunk);
		});
	}

}
