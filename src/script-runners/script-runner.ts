import {EventEmitter} from 'events';
import {ImbaConfiguration, ImbaEnvironmentScriptConfiguration, ImbaProjectScriptConfiguration, ImbaProjectScriptListConfiguration} from '../definitions';
import {RunnerFactory} from '../runners';
import * as _ from 'lodash';


export declare interface ScriptCommandStartArg
{
	command: string,
	scriptProject: ImbaProjectScriptConfiguration,
}


export declare interface ScriptCommandOutputArg
{
	chunk: string,
	scriptProject: ImbaProjectScriptConfiguration,
}


export abstract class ScriptRunner extends EventEmitter
{


	private runnerFactory: RunnerFactory;

	private config: ImbaConfiguration;


	constructor(runnerFactory: RunnerFactory, config: ImbaConfiguration)
	{
		super();

		this.runnerFactory = runnerFactory;
		this.config = config;
	}


	public async runScript(scriptName: string): Promise<number>
	{
		const script = this.config.scripts[scriptName];
		const projects = script.projects;

		this.emit('start', scriptName);
		const returnCode = await this.doRunScript(projects);
		this.emit('end', returnCode);

		return returnCode;
	}


	protected abstract async doRunScript(projects: ImbaProjectScriptListConfiguration): Promise<number>;


	protected async runProjectScript(scriptProject: ImbaProjectScriptConfiguration): Promise<number>
	{
		const scriptName = scriptProject.parentScript.name;
		const scriptEnvironment = scriptProject.parentScript.environment;
		const projectName = scriptProject.project.name;

		this.emit('projectStart', scriptProject);

		if (scriptProject.beforeScript.length) {
			await this.runScriptStack(scriptProject, scriptProject.beforeScript, this.modifyEnvironment(scriptEnvironment, {
				IMBA_SCRIPT_NAME: scriptName,
				IMBA_SCRIPT_TYPE_NAME: 'before_script',
				IMBA_PROJECT_NAME: projectName,
			}));
		}

		const returnCode = await this.runScriptStack(scriptProject, scriptProject.script, this.modifyEnvironment(scriptEnvironment, {
			IMBA_SCRIPT_NAME: scriptName,
			IMBA_SCRIPT_TYPE_NAME: 'script',
			IMBA_PROJECT_NAME: projectName,
		}));

		if (scriptProject.afterScript.length) {
			await this.runScriptStack(scriptProject, scriptProject.afterScript, this.modifyEnvironment(scriptEnvironment, {
				IMBA_SCRIPT_NAME: scriptName,
				IMBA_SCRIPT_TYPE_NAME: 'after_script',
				IMBA_PROJECT_NAME: projectName,
				IMBA_SCRIPT_RETURN_CODE: `${returnCode}`,
			}));
		}

		this.emit('projectEnd', scriptProject);

		return returnCode;
	}


	private async runScriptStack(scriptProject: ImbaProjectScriptConfiguration, commands: Array<string>, environment: ImbaEnvironmentScriptConfiguration): Promise<number>
	{
		let returnCode = 0;

		for (let i = 0; i < commands.length; i++) {
			returnCode = await this.runCommand(scriptProject, commands[i], environment);

			if (returnCode > 0) {
				return returnCode;
			}
		}

		return returnCode;
	}


	private runCommand(scriptProject: ImbaProjectScriptConfiguration, command: string, environment: ImbaEnvironmentScriptConfiguration): Promise<number>
	{
		const runner = this.runnerFactory.createRunner(scriptProject.project.root, command, environment);

		runner.addListener('start', (command) => {
			this.emit('commandRun', {
				command: command,
				scriptProject: scriptProject,
			});
		});

		runner.addListener('stdout', (chunk) => {
			this.emit('commandStdout', {
				chunk: chunk,
				scriptProject: scriptProject,
			});
		});

		runner.addListener('stderr', (chunk) => {
			this.emit('commandStderr', {
				chunk: chunk,
				scriptProject: scriptProject,
			});
		});

		return runner.run();
	}


	private modifyEnvironment(environment: ImbaEnvironmentScriptConfiguration, append: ImbaEnvironmentScriptConfiguration): ImbaEnvironmentScriptConfiguration
	{
		return _.merge(_.clone(environment), append);
	}

}
