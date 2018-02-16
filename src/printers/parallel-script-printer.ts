import {ScriptPrinter} from './script-printer';
import {ScriptRunner} from '../script-runners';
import chalk from 'chalk';


export class ParallelScriptPrinter extends ScriptPrinter
{


	public enablePrinter(runner: ScriptRunner): void
	{
		runner.onStart.subscribe((script) => {
			this.output.log(chalk.bold.blue(`Running ${script} in parallel mode`));
			this.printSeparator();
		});

		runner.onCommandRun.subscribe((command) => {
			this.output.log(chalk.magenta(chalk.magenta(`[${command.project.name}]`) + ' - ' + command.command));
		});

		runner.onCommandStdout.subscribe((output) => {
			this.output.stdout(chalk.magenta(`[${output.project.name}]`) + ' ' + output.chunk);
		});

		runner.onCommandStderr.subscribe((output) => {
			this.output.stderr(chalk.magenta(`[${output.project.name}]`) + ' ' + output.chunk);
		});
	}

}
