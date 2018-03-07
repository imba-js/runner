import {ChildProcess} from '@imba/spawn';
import {Printer} from './printer';
import {Project} from '../project';
import chalk from 'chalk';


export class ProjectCommandPrinter extends Printer
{


	public enable(childProcess: ChildProcess, project: Project): void
	{
		childProcess.onStart.subscribe((command) => {
			this.output.log(chalk.bold.blue(`Running ${command} on ${project.name}`));
			this.printSeparator();
			this.output.log('');
		});

		childProcess.onStdout.subscribe((chunk) => {
			this.output.stdout(chunk);
		});

		childProcess.onStderr.subscribe((chunk) => {
			this.output.stderr(chunk);
		});
	}

}
