import {MockChildProcessFactory} from '@imba/spawn';
import {Printer} from './printer';
import {Imba} from '../imba';
import {RunContext, RunState} from '../run-context';
import {Script} from '../script';
import {Project} from '../project';
import {EnvironmentVariable} from '../environment-variable';
import {Input} from '../input';
import {Command} from '../commands';
import chalk from 'chalk';
import * as _ from 'lodash';


export class InfoPrinter extends Printer
{


	public printInfo(configFile: string, imba: Imba): void
	{
		const childProcessFactory = new MockChildProcessFactory;

		this.output.log(chalk.bold.blue('Configuration'));
		this.printSeparator();
		this.output.log(configFile);

		this.output.log('');
		this.output.log(chalk.bold.blue('Projects'));
		this.printSeparator();

		_.forEach(imba.getProjects(), (project: Project) => {
			this.output.log(chalk.green(project.name));
			this.output.log(`  ${chalk.magenta('root')}: ${project.root}`);
		});

		this.output.log('');
		this.output.log(chalk.bold.blue('Scripts'));
		this.printSeparator();

		_.forEach(imba.getScripts(), (script: Script) => {
			if (script.isHidden()) {
				return;
			}

			this.output.log(chalk.green(script.name));

			if (script.hasDescription()) {
				this.output.log(`  ${chalk.magenta('Description:')} ${script.getDescription()}`);
			}

			this.output.log(`  ${chalk.magenta('Mode:')} ${script.getMode()}`);

			if (script.hasEnvs()) {
				this.output.log(`  ${chalk.magenta('Environment:')}`);

				_.forEach(script.getEnvs(), (env: EnvironmentVariable) => {
					this.output.log(`    - ${env.name}: ${env.value}`);
				});
			}

			if (script.hasInputs()) {
				this.output.log(`  ${chalk.magenta('Inputs:')}`);

				_.forEach(script.getInputs(), (input: Input) => {
					const meta = [];

					if (input.required) {
						meta.push('required');
					}

					if (!_.isUndefined(input.defaultValue)) {
						meta.push(`default: ${input.defaultValue}`);
					}

					this.output.log(`    - ${meta.length ? '(' + meta.join(', ') + ') ' : ''}${input.name}: ${input.question}`);
				});
			}

			this.output.log(`  ${chalk.magenta('Projects:')}`);

			_.forEach(script.getAllowedProjects(), (project: Project) => {
				this.output.log(`    ${chalk.green(project.name)}`);

				const runContext = new RunContext(RunState.PrintInfo, project);

				if (script.hasBeforeScripts()) {
					this.output.log(`      ${chalk.magenta('before_script')}`);

					_.forEach(script.getBeforeScripts(), (beforeScript: Script) => {
						if (beforeScript.isHidden()) {
							_.forEach(beforeScript.createScriptContext(childProcessFactory, runContext).getCommands(), (command: Command) => {
								this.output.log(`        - Command: ${command.name}`);
							});

						} else {
							this.output.log(`        - Script: ${beforeScript.name}`);
						}
					});
				}

				if (script.hasAfterScripts()) {
					this.output.log(`      ${chalk.magenta('after_script')}`);

					_.forEach(script.getAfterScripts(), (afterScript: Script) => {
						if (afterScript.isHidden()) {
							_.forEach(afterScript.createScriptContext(childProcessFactory, runContext).getCommands(), (command: Command) => {
								this.output.log(`        - Command: ${command.name}`);
							});

						} else {
							this.output.log(`        - Script: ${afterScript.name}`);
						}
					});
				}

				this.output.log(`      ${chalk.magenta('script')}`);

				_.forEach(script.createScriptContext(childProcessFactory, runContext).getCommands(), (command: Command) => {
					this.output.log(`        - Command: ${command.name}`);
				});
			});
		});
	}

}
