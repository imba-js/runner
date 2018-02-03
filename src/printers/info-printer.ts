import {printSeparator} from './_helpers';
import {Output} from '../outputs';
import {ImbaConfiguration} from '../definitions';
import chalk from 'chalk';
import * as _ from 'lodash';


export class InfoPrinter
{


	private output: Output;


	constructor(output: Output)
	{
		this.output = output;
	}


	public printInfo(config: ImbaConfiguration): void
	{
		this.output.log(chalk.bold.blue('Configuration'));
		printSeparator(this.output);
		this.output.log(config.file);

		this.output.log('');
		this.output.log(chalk.bold.blue('Projects'));
		printSeparator(this.output);

		_.forEach(config.projects, (project, name) => {
			this.output.log(chalk.green(name));
			this.output.log(`  ${chalk.magenta('root')}: ${project.root}`);
		});

		this.output.log('');
		this.output.log(chalk.bold.blue('Scripts'));
		printSeparator(this.output);

		_.forEach(config.scripts, (script, name) => {
			this.output.log(chalk.green(name));

			if (_.size(script.environment)) {
				this.output.log(`  ${chalk.magenta('Environment:')}`);

				_.forEach(script.environment, (value, key) => {
					this.output.log(`    - ${key}: ${value}`);
				});
			}

			this.output.log(`  ${chalk.magenta('Projects:')}`);

			_.forEach(script.projects, (scriptProject, scriptProjectName) => {
				this.output.log(`    ${chalk.green(scriptProjectName)}`);

				if (scriptProject.beforeScript.length) {
					this.output.log(`      ${chalk.magenta('before_script')}`);
					_.forEach(scriptProject.beforeScript, (script) => {
						this.output.log(`        - ${script}`);
					});
				}

				if (scriptProject.afterScript.length) {
					this.output.log(`      ${chalk.magenta('after_script')}`);
					_.forEach(scriptProject.afterScript, (script) => {
						this.output.log(`        - ${script}`);
					});
				}

				this.output.log(`      ${chalk.magenta('script')}`);
				_.forEach(scriptProject.script, (script) => {
					this.output.log(`        - ${script}`);
				});
			});
		});
	}

}
