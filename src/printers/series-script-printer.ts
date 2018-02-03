import {printSeparator} from './_helpers';
import {ScriptPrinter} from './script-printer';
import {ScriptRunner} from '../script-runners';
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
			printSeparator(this.output);

			projectsCount++;
		});

		runner.addListener('commandRun', (command: string) => {
			this.output.log(chalk.magenta(` - ${command}`));
		});

		runner.addListener('commandStdout', (stdout: string) => {
			this.output.stdout(stdout);
		});

		runner.addListener('commandStderr', (stderr: string) => {
			this.output.stderr(stderr);
		});
	}

}
