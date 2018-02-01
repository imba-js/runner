import {ImbaConfiguration} from './definitions';
import * as termSize from 'term-size';
import chalk from 'chalk';
import * as _ from 'lodash';


export function printSeparator(): void
{
	const width: number = termSize().columns;
	console.log(chalk.bold.blue(_.repeat('=', width)));
}


export function printInfo(config: ImbaConfiguration): void
{
	const width: number = termSize().columns;

	console.log(chalk.bold.blue('Configuration'));
	printSeparator();
	console.log(config.file);

	console.log('');
	console.log(chalk.bold.blue('Projects'));
	printSeparator();

	_.forEach(config.projects, (project, name) => {
		console.log(chalk.green(name));
		console.log(`  ${chalk.magenta('root')}: ${project.root}`);
	});

	console.log('');
	console.log(chalk.bold.blue('Scripts'));
	console.log(chalk.bold.blue(_.repeat('=', width)));

	_.forEach(config.scripts, (script, name) => {
		console.log(chalk.green(name));

		if (_.size(script.environment)) {
			console.log(`  ${chalk.magenta('Environment:')}`);

			_.forEach(script.environment, (value, key) => {
				console.log(`    - ${key}: ${value}`);
			});
		}

		console.log(`  ${chalk.magenta('Projects:')}`);

		_.forEach(script.projects, (scriptProject, scriptProjectName) => {
			console.log(`    ${chalk.green(scriptProjectName)}`);

			if (scriptProject.beforeScript.length) {
				console.log(`      ${chalk.magenta('before_script')}`);
				_.forEach(scriptProject.beforeScript, (script) => {
					console.log(`        - ${script}`);
				});
			}

			if (scriptProject.afterScript.length) {
				console.log(`      ${chalk.magenta('after_script')}`);
				_.forEach(scriptProject.afterScript, (script) => {
					console.log(`        - ${script}`);
				});
			}

			console.log(`      ${chalk.magenta('script')}`);
			_.forEach(scriptProject.script, (script) => {
				console.log(`        - ${script}`);
			});
		});
	});
}
