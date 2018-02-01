import {ImbaConfiguration, ImbaProjectConfiguration, ImbaProjectScriptConfiguration, ImbaEnvironmentScriptConfiguration} from './definitions';
import {getProjectConfiguration} from './configuration';
import {printSeparator} from './printer';
import {spawn} from 'child_process';
import chalk from 'chalk';
import * as _ from 'lodash';


export async function runScript(config: ImbaConfiguration, script: string): Promise<number>
{
	const projects = config.scripts[script].projects;
	let returnCode = 0;
	let i = 0;

	return new Promise<number>(async (resolve) => {
		for (let name in projects) {
			if (projects.hasOwnProperty(name)) {
				if (i > 0) {
					console.log('');
				}

				i++;

				const currentReturnCode = await runProjectScript(script, name, getProjectConfiguration(config, name), projects[name], config.scripts[script].environment);

				if (currentReturnCode > 0) {
					returnCode = currentReturnCode;
				}
			}
		}

		resolve(returnCode);
	});
}


async function runProjectScript(script: string, name: string, projectConfig: ImbaProjectConfiguration, project: ImbaProjectScriptConfiguration, environment: ImbaEnvironmentScriptConfiguration): Promise<number>
{
	console.log(chalk.bold.blue(`Running ${script} on ${name}`));
	printSeparator();

	if (project.beforeScript.length) {
		await runScriptStack(projectConfig, project.beforeScript, modifyEnvironment(environment, {
			IMBA_SCRIPT_NAME: script,
			IMBA_SCRIPT_TYPE_NAME: 'before_script',
			IMBA_PROJECT_NAME: name,
		}));
	}

	const returnCode = await runScriptStack(projectConfig, project.script, modifyEnvironment(environment, {
		IMBA_SCRIPT_NAME: script,
		IMBA_SCRIPT_TYPE_NAME: 'script',
		IMBA_PROJECT_NAME: name,
	}));

	if (project.afterScript.length) {
		await runScriptStack(projectConfig, project.afterScript, modifyEnvironment(environment, {
			IMBA_SCRIPT_NAME: script,
			IMBA_SCRIPT_TYPE_NAME: 'after_script',
			IMBA_PROJECT_NAME: name,
			IMBA_SCRIPT_RETURN_CODE: `${returnCode}`,
		}));
	}

	return returnCode;
}


async function runScriptStack(project: ImbaProjectConfiguration, stack: Array<string>, environment: ImbaEnvironmentScriptConfiguration): Promise<number>
{
	let returnCode = 0;

	for (let i = 0; i < stack.length; i++) {
		returnCode = await runCommand(project, stack[i], environment);

		if (returnCode > 0) {
			return returnCode;
		}
	}

	return returnCode;
}


function runCommand(project: ImbaProjectConfiguration, command: string, environment: ImbaEnvironmentScriptConfiguration): Promise<number>
{
	console.log(chalk.magenta(` - ${command}`));

	return new Promise<number>((resolve) => {
		const child = spawn(command, [], {
			shell: true,
			cwd: project.root,
			env: environment,
		});

		child.stdout.pipe(process.stdout);
		child.stderr.pipe(process.stderr);

		child.on('close', (returnCode) => {
			resolve(returnCode);
		});
	});
}


function modifyEnvironment(environment: ImbaEnvironmentScriptConfiguration, append: ImbaEnvironmentScriptConfiguration): ImbaEnvironmentScriptConfiguration
{
	return _.merge(_.clone(environment), append);
}
