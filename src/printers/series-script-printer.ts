import {ScriptPrinter} from './script-printer';
import {ScriptRunner} from '../script-runners';
import chalk from 'chalk';


export class SeriesScriptPrinter extends ScriptPrinter
{


	public enablePrinter(runner: ScriptRunner): void
	{
		let projectsCount = 0;

		runner.onProjectStart.subscribe((scriptProject) => {
			if (projectsCount) {
				this.output.log('');
			}

			this.output.log(chalk.bold.blue(`Running ${scriptProject.script.name} on ${scriptProject.project.name}`));
			this.printSeparator();

			projectsCount++;
		});

		runner.onCommandRun.subscribe((command) => {
			this.output.log(chalk.magenta(` - ${command.command.name}`));
		});

		runner.onCommandStdout.subscribe((output) => {
			this.output.stdout(output.chunk);
		});

		runner.onCommandStderr.subscribe((output) => {
			this.output.stderr(output.chunk);
		});
	}

}
