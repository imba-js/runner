import {printSeparator} from './_helpers';
import {ScriptPrinter} from './script-printer';
import {ScriptRunner, ScriptCommandStartArg, ScriptCommandOutputArg} from '../script-runners';
import chalk from 'chalk';


export class ParallelScriptPrinter extends ScriptPrinter
{


	public enablePrinter(runner: ScriptRunner): void
	{
		runner.addListener('start', (script) => {
			this.output.log(chalk.bold.blue(`Running ${script} in parallel mode`));
			printSeparator(this.output);
		});

		runner.addListener('commandRun', (command: ScriptCommandStartArg) => {
			this.output.log(chalk.magenta(chalk.magenta(`[${command.scriptProject.project.name}]`) + ' - ' + command.command));
		});

		runner.addListener('commandStdout', (output: ScriptCommandOutputArg) => {
			this.output.stdout(chalk.magenta(`[${output.scriptProject.project.name}]`) + ' ' + output.chunk);
		});

		runner.addListener('commandStderr', (output: ScriptCommandOutputArg) => {
			this.output.stderr(chalk.magenta(`[${output.scriptProject.project.name}]`) + ' ' + output.chunk);
		});
	}

}
