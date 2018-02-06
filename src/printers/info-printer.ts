import {Printer} from './printer';
import {ImbaConfiguration, ImbaScriptMode} from '../definitions';
import chalk from 'chalk';
import * as _ from 'lodash';


export class InfoPrinter extends Printer
{


	public printInfo(config: ImbaConfiguration): void
	{
		this.output.log(chalk.bold.blue('Configuration'));
		this.printSeparator();
		this.output.log(config.file);

		this.output.log('');
		this.output.log(chalk.bold.blue('Projects'));
		this.printSeparator();

		_.forEach(config.projects, (project, name) => {
			this.output.log(chalk.green(name));
			this.output.log(`  ${chalk.magenta('root')}: ${project.root}`);
		});

		this.output.log('');
		this.output.log(chalk.bold.blue('Scripts'));
		this.printSeparator();

		_.forEach(config.scripts, (script, name) => {
			this.output.log(chalk.green(name));
			this.output.log(`  ${chalk.magenta('Mode:')} ${ImbaScriptMode[script.mode]}`);

			if (_.size(script.dependencies)) {
				this.output.log(`  ${chalk.magenta('Dependencies:')}`);

				_.forEach(script.dependencies, (dependency) => {
					this.output.log(`    - ${dependency}`);
				});
			}

			if (_.size(script.environment)) {
				this.output.log(`  ${chalk.magenta('Environment:')}`);

				_.forEach(script.environment, (value, key) => {
					this.output.log(`    - ${key}: ${value}`);
				});
			}

			if (_.size(script.inputs)) {
				this.output.log(`  ${chalk.magenta('Inputs:')}`);

				_.forEach(script.inputs, (input) => {
					this.output.log(`    - ${input.required ? '(Required) ' : ''}${input.name}: ${input.question}`);
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
