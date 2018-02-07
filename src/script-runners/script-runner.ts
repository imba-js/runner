import {EventEmitter} from 'events';
import {ImbaConfiguration, ImbaEnvironmentScriptConfiguration, ImbaProjectScriptConfiguration, ImbaProjectScriptListConfiguration, ImbaInputScriptConfiguration} from '../definitions';
import {RunnerFactory} from '../runners';
import {Output} from '../outputs';
import * as readline from 'readline';
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

	private output: Output;

	private config: ImbaConfiguration;


	constructor(runnerFactory: RunnerFactory, output: Output, config: ImbaConfiguration)
	{
		super();

		this.runnerFactory = runnerFactory;
		this.output = output;
		this.config = config;
	}


	public async runScript(scriptName: string): Promise<number>
	{
		const script = this.config.scripts[scriptName];
		const projects = script.projects;
		const inputs = script.inputs;

		let inputAnswers = {};

		if (_.size(inputs)) {
			inputAnswers = await this.askQuestions(inputs);
		}

		this.emit('start', scriptName);
		const returnCode = await this.doRunScript(projects, inputAnswers);
		this.emit('end', returnCode);

		return returnCode;
	}


	protected abstract async doRunScript(projects: ImbaProjectScriptListConfiguration, inputs: ImbaEnvironmentScriptConfiguration): Promise<number>;


	protected async runProjectScript(scriptProject: ImbaProjectScriptConfiguration, inputs: ImbaEnvironmentScriptConfiguration): Promise<number>
	{
		const scriptName = scriptProject.parentScript.name;
		const scriptEnvironment = scriptProject.parentScript.environment;
		const projectName = scriptProject.project.name;

		this.emit('projectStart', scriptProject);

		if (scriptProject.beforeScript.length) {
			await this.runScriptStack(scriptProject, scriptProject.beforeScript, this.modifyEnvironment(scriptEnvironment, inputs, {
				IMBA_SCRIPT_NAME: scriptName,
				IMBA_SCRIPT_TYPE_NAME: 'before_script',
				IMBA_PROJECT_NAME: projectName,
			}));
		}

		const returnCode = await this.runScriptStack(scriptProject, scriptProject.script, this.modifyEnvironment(scriptEnvironment, inputs, {
			IMBA_SCRIPT_NAME: scriptName,
			IMBA_SCRIPT_TYPE_NAME: 'script',
			IMBA_PROJECT_NAME: projectName,
		}));

		if (scriptProject.afterScript.length) {
			await this.runScriptStack(scriptProject, scriptProject.afterScript, this.modifyEnvironment(scriptEnvironment, inputs, {
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


	private modifyEnvironment(environment: ImbaEnvironmentScriptConfiguration, inputs: ImbaEnvironmentScriptConfiguration, append: ImbaEnvironmentScriptConfiguration): ImbaEnvironmentScriptConfiguration
	{
		const env: ImbaEnvironmentScriptConfiguration = _.merge(_.clone(environment), inputs, append);

		if (!_.isUndefined(process.env.PATH)) {
			env.PATH = process.env.PATH;
		}

		return env;
	}


	private async askQuestions(inputs: Array<ImbaInputScriptConfiguration>): Promise<ImbaEnvironmentScriptConfiguration>
	{
		const result: ImbaEnvironmentScriptConfiguration = {};
		const output = this.output;

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		async function askQuestion(input: ImbaInputScriptConfiguration): Promise<string>
		{
			return new Promise<string>((resolve) => {
				rl.question(`${input.question} ${_.isUndefined(input.default) ? '' : '[' + input.default + ']'}: `, (answer) => {
					answer = answer.trim();

					if (input.required && answer === '') {
						output.log('This question is required.');
						resolve(askQuestion(input));
					} else {
						if (answer === '' && !_.isUndefined(input.default)) {
							answer = input.default;
						}

						resolve(answer);
					}
				});
			});
		}

		for (let i = 0; i < inputs.length; i++) {
			result[inputs[i].name] = await askQuestion(inputs[i]);
		}

		rl.close();

		return result;
	}

}
