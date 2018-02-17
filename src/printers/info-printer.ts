import {Printer} from './printer';
import {Imba} from '../imba';
import {ScriptMode} from '../script';
import chalk from 'chalk';
import * as _ from 'lodash';


export class InfoPrinter extends Printer
{


	public printInfo(configFile: string, imba: Imba): void
	{
		this.output.log(chalk.bold.blue('Configuration'));
		this.printSeparator();
		this.output.log(configFile);

		this.output.log('');
		this.output.log(chalk.bold.blue('Projects'));
		this.printSeparator();

		_.forEach(imba.getProjects(), (project) => {
			this.output.log(chalk.green(project.name));
			this.output.log(`  ${chalk.magenta('root')}: ${project.root}`);
		});

		this.output.log('');
		this.output.log(chalk.bold.blue('Scripts'));
		this.printSeparator();

		_.forEach(imba.getScripts(), (script) => {
			this.output.log(chalk.green(script.name));
			this.output.log(`  ${chalk.magenta('Mode:')} ${script.getMode()}`);

			if (script.hasDependencies()) {
				this.output.log(`  ${chalk.magenta('Dependencies:')}`);

				_.forEach(script.getDependencies(), (dependency) => {
					this.output.log(`    - ${dependency}`);
				});
			}

			if (script.hasEnvs()) {
				this.output.log(`  ${chalk.magenta('Environment:')}`);

				_.forEach(script.getEnvs(), (env) => {
					this.output.log(`    - ${env.name}: ${env.value}`);
				});
			}

			if (script.hasInputs()) {
				this.output.log(`  ${chalk.magenta('Inputs:')}`);

				_.forEach(script.getInputs(), (input) => {
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

			_.forEach(script.getAllowedProjects(imba), (project) => {
				this.output.log(`    ${chalk.green(project.name)}`);

				const beforeCommands = script.createBeforeCommands({
					project: project,
					scriptReturnCode: undefined,
				});

				const afterCommands = script.createAfterCommands({
					project: project,
					scriptReturnCode: undefined,
				});

				const commands = script.createCommands({
					project: project,
					scriptReturnCode: undefined,
				});

				if (!beforeCommands.isEmpty()) {
					this.output.log(`      ${chalk.magenta('before_script')}`);
					_.forEach(beforeCommands.getCommands(), (cmd) => {
						this.output.log(`        - ${cmd.command}`);
					});
				}

				if (!afterCommands.isEmpty()) {
					this.output.log(`      ${chalk.magenta('after_script')}`);
					_.forEach(afterCommands.getCommands(), (cmd) => {
						this.output.log(`        - ${cmd.command}`);
					});
				}

				this.output.log(`      ${chalk.magenta('script')}`);
				_.forEach(commands.getCommands(), (cmd) => {
					this.output.log(`        - ${cmd.command}`);
				});
			});
		});
	}

}
