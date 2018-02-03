import {ImbaConfiguration, ImbaProjectScriptConfiguration} from './definitions';
import {ScriptRunner} from './script-runners';
import {Output} from './outputs';
import * as termSize from 'term-size';
import chalk from 'chalk';
import * as _ from 'lodash';


export function printSeparator(output: Output): void
{
	const width: number = termSize().columns;
	output.log(chalk.bold.blue(_.repeat('=', width)));
}


export function printInfo(output: Output, config: ImbaConfiguration): void
{
	const width: number = termSize().columns;

	output.log(chalk.bold.blue('Configuration'));
	printSeparator(output);
	output.log(config.file);

	output.log('');
	output.log(chalk.bold.blue('Projects'));
	printSeparator(output);

	_.forEach(config.projects, (project, name) => {
		output.log(chalk.green(name));
		output.log(`  ${chalk.magenta('root')}: ${project.root}`);
	});

	output.log('');
	output.log(chalk.bold.blue('Scripts'));
	output.log(chalk.bold.blue(_.repeat('=', width)));

	_.forEach(config.scripts, (script, name) => {
		output.log(chalk.green(name));

		if (_.size(script.environment)) {
			output.log(`  ${chalk.magenta('Environment:')}`);

			_.forEach(script.environment, (value, key) => {
				output.log(`    - ${key}: ${value}`);
			});
		}

		output.log(`  ${chalk.magenta('Projects:')}`);

		_.forEach(script.projects, (scriptProject, scriptProjectName) => {
			output.log(`    ${chalk.green(scriptProjectName)}`);

			if (scriptProject.beforeScript.length) {
				output.log(`      ${chalk.magenta('before_script')}`);
				_.forEach(scriptProject.beforeScript, (script) => {
					output.log(`        - ${script}`);
				});
			}

			if (scriptProject.afterScript.length) {
				output.log(`      ${chalk.magenta('after_script')}`);
				_.forEach(scriptProject.afterScript, (script) => {
					output.log(`        - ${script}`);
				});
			}

			output.log(`      ${chalk.magenta('script')}`);
			_.forEach(scriptProject.script, (script) => {
				output.log(`        - ${script}`);
			});
		});
	});
}


export function printRunner(output: Output, runner: ScriptRunner): void
{
	let projectsCount = 0;

	runner.addListener('projectStart', (scriptProject: ImbaProjectScriptConfiguration) => {
		if (projectsCount) {
			output.log('');
		}

		output.log(chalk.bold.blue(`Running ${scriptProject.parentScript.name} on ${scriptProject.project.name}`));
		printSeparator(output);

		projectsCount++;
	});

	runner.addListener('commandRun', (command: string) => {
		output.log(chalk.magenta(` - ${command}`));
	});

	runner.addListener('commandStdout', (stdout: string) => {
		output.stdout(stdout);
	});

	runner.addListener('commandStderr', (stderr: string) => {
		output.stderr(stderr);
	});
}
