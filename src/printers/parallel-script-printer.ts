import {ScriptPrinter} from './script-printer';
import {ScriptRunner, ScriptCommandStartArg, ScriptCommandOutputArg} from '../script-runners';
import chalk from 'chalk';


export class ParallelScriptPrinter extends ScriptPrinter
{


	public enablePrinter(runner: ScriptRunner): void
	{
		runner.addListener('start', (script) => {
			this.output.log(chalk.bold.blue(`Running ${script} in parallel mode`));
			this.printSeparator();
		});

		runner.addListener('commandRun', (command: ScriptCommandStartArg) => {
			this.output.log(chalk.magenta(chalk.magenta(`[${command.project.name}]`) + ' - ' + command.command));
		});

		runner.addListener('commandStdout', (output: ScriptCommandOutputArg) => {
			this.output.stdout(chalk.magenta(`[${output.project.name}]`) + ' ' + output.chunk);
		});

		runner.addListener('commandStderr', (output: ScriptCommandOutputArg) => {
			this.output.stderr(chalk.magenta(`[${output.project.name}]`) + ' ' + output.chunk);
		});
	}

}
