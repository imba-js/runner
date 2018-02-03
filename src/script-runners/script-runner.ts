import {EventEmitter} from 'events';
import {ImbaConfiguration, ImbaEnvironmentScriptConfiguration, ImbaProjectScriptConfiguration, ImbaProjectScriptListConfiguration} from '../definitions';
import {RunnerFactory} from '../runners';
import * as _ from 'lodash';


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

		const dependencies = script.dependencies;
		const projects = script.projects;

		if (dependencies.length) {
			this.emit('dependenciesStart', scriptName);

			for (let i = 0; i < dependencies.length; i++) {
				await this.runScript(dependencies[i]);
			}

			this.emit('dependenciesEnd', scriptName);
		}

		return await this.doRunScript(projects);
	}


	protected abstract async doRunScript(projects: ImbaProjectScriptListConfiguration): Promise<number>;


	protected async runProjectScript(scriptProject: ImbaProjectScriptConfiguration): Promise<number>
	{
		const scriptName = scriptProject.parentScript.name;
		const scriptEnvironment = scriptProject.parentScript.environment;
		const projectName = scriptProject.project.name;
		const projectRoot = scriptProject.project.root;

		this.emit('projectStart', scriptProject);

		if (scriptProject.beforeScript.length) {
			await this.runScriptStack(projectRoot, scriptProject.beforeScript, this.modifyEnvironment(scriptEnvironment, {
				IMBA_SCRIPT_NAME: scriptName,
				IMBA_SCRIPT_TYPE_NAME: 'before_script',
				IMBA_PROJECT_NAME: projectName,
			}));
		}

		const returnCode = await this.runScriptStack(projectRoot, scriptProject.script, this.modifyEnvironment(scriptEnvironment, {
			IMBA_SCRIPT_NAME: scriptName,
			IMBA_SCRIPT_TYPE_NAME: 'script',
			IMBA_PROJECT_NAME: projectName,
		}));

		if (scriptProject.afterScript.length) {
			await this.runScriptStack(projectRoot, scriptProject.afterScript, this.modifyEnvironment(scriptEnvironment, {
				IMBA_SCRIPT_NAME: scriptName,
				IMBA_SCRIPT_TYPE_NAME: 'after_script',
				IMBA_PROJECT_NAME: projectName,
				IMBA_SCRIPT_RETURN_CODE: `${returnCode}`,
			}));
		}

		this.emit('projectEnd', scriptProject);

		return returnCode;
	}


	private async runScriptStack(root: string, commands: Array<string>, environment: ImbaEnvironmentScriptConfiguration): Promise<number>
	{
		let returnCode = 0;

		for (let i = 0; i < commands.length; i++) {
			returnCode = await this.runCommand(root, commands[i], environment);

			if (returnCode > 0) {
				return returnCode;
			}
		}

		return returnCode;
	}


	private runCommand(root: string, command: string, environment: ImbaEnvironmentScriptConfiguration): Promise<number>
	{
		const runner = this.runnerFactory.createRunner(root, command, environment);

		runner.addListener('start', (command) => {
			this.emit('commandRun', command);
		});

		runner.addListener('stdout', (command) => {
			this.emit('commandStdout', command);
		});

		runner.addListener('stderr', (command) => {
			this.emit('commandStderr', command);
		});

		return runner.run();
	}


	private modifyEnvironment(environment: ImbaEnvironmentScriptConfiguration, append: ImbaEnvironmentScriptConfiguration): ImbaEnvironmentScriptConfiguration
	{
		return _.merge(_.clone(environment), append);
	}

}
