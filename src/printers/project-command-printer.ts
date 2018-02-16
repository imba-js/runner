import {Printer} from './printer';
import {Runner} from '../runners';
import {Project} from '../project';
import chalk from 'chalk';


export class ProjectCommandPrinter extends Printer
{


	public enable(runner: Runner, project: Project): void
	{
		runner.onStart.subscribe((command) => {
			this.output.log(chalk.bold.blue(`Running ${command} on ${project.name}`));
			this.printSeparator();
			this.output.log('');
		});

		runner.onStdout.subscribe((chunk) => {
			this.output.stdout(chunk);
		});

		runner.onStderr.subscribe((chunk) => {
			this.output.stderr(chunk);
		});
	}

}
