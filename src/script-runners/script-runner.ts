import {RunnerFactory} from '../runners';
import {Output} from '../outputs';
import {Command} from '../command';
import {CommandsStorage} from '../commands-storage';
import {Project} from '../project';
import {Script} from '../script';
import {EventEmitter} from '../event-emitter';
import {createScriptEnvironment, EnvList} from '../environment-variable';


export declare interface ScriptCommandStartArg
{
	command: string,
	project: Project,
}


export declare interface ScriptCommandOutputArg
{
	chunk: string,
	project: Project,
}


export declare interface ScriptProjectArg
{
	project: Project,
	script: Script,
}


export abstract class ScriptRunner
{


	public onStart: EventEmitter<string> = new EventEmitter<string>();

	public onEnd: EventEmitter<number> = new EventEmitter<number>();

	public onProjectStart: EventEmitter<ScriptProjectArg> = new EventEmitter<ScriptProjectArg>();

	public onProjectEnd: EventEmitter<ScriptProjectArg> = new EventEmitter<ScriptProjectArg>();

	public onCommandRun: EventEmitter<ScriptCommandStartArg> = new EventEmitter<ScriptCommandStartArg>();

	public onCommandStdout: EventEmitter<ScriptCommandOutputArg> = new EventEmitter<ScriptCommandOutputArg>();

	public onCommandStderr: EventEmitter<ScriptCommandOutputArg> = new EventEmitter<ScriptCommandOutputArg>();

	private runnerFactory: RunnerFactory;

	private output: Output;


	constructor(runnerFactory: RunnerFactory, output: Output)
	{
		this.runnerFactory = runnerFactory;
		this.output = output;
	}


	public async runScript(projects: Array<Project>, script: Script, inputAnswers: EnvList = {}): Promise<number>
	{
		this.onStart.emit(script.name);
		const returnCode = await this.doRunScript(projects, script, inputAnswers);
		this.onEnd.emit(returnCode);

		return returnCode;
	}


	protected abstract async doRunScript(projects: Array<Project>, script: Script, inputAnswers: EnvList): Promise<number>;


	protected async runProjectScript(project: Project, script: Script, inputAnswers: EnvList): Promise<number>
	{
		const scriptName = script.name;
		const scriptEnvironment = script.getEnvs();
		const projectName = project.name;

		this.onProjectStart.emit({
			project: project,
			script: script,
		});

		if (script.hasBeforeDefinition()) {
			await this.runScriptStack(project, script.createBeforeCommands({
				project: project,
				scriptReturnCode: undefined,
			}), createScriptEnvironment(scriptEnvironment, inputAnswers, {
				IMBA_SCRIPT_NAME: scriptName,
				IMBA_SCRIPT_TYPE_NAME: 'before_script',
				IMBA_PROJECT_NAME: projectName,
			}));
		}

		const returnCode = await this.runScriptStack(project, script.createCommands({
			project: project,
			scriptReturnCode: undefined,
		}), createScriptEnvironment(scriptEnvironment, inputAnswers, {
			IMBA_SCRIPT_NAME: scriptName,
			IMBA_SCRIPT_TYPE_NAME: 'script',
			IMBA_PROJECT_NAME: projectName,
		}));

		if (script.hasAfterDefinition()) {
			await this.runScriptStack(project, script.createAfterCommands({
				project: project,
				scriptReturnCode: returnCode,
			}), createScriptEnvironment(scriptEnvironment, inputAnswers, {
				IMBA_SCRIPT_NAME: scriptName,
				IMBA_SCRIPT_TYPE_NAME: 'after_script',
				IMBA_PROJECT_NAME: projectName,
				IMBA_SCRIPT_RETURN_CODE: `${returnCode}`,
			}));
		}

		this.onProjectEnd.emit({
			project: project,
			script: script,
		});

		return returnCode;
	}


	private async runScriptStack(project: Project, commands: CommandsStorage, environment: EnvList): Promise<number>
	{
		const _commands = commands.getCommands();
		let returnCode = 0;

		for (let i = 0; i < _commands.length; i++) {
			returnCode = await this.runCommand(project, _commands[i], environment);

			if (returnCode > 0) {
				return returnCode;
			}
		}

		return returnCode;
	}


	private runCommand(project: Project, command: Command, environment: EnvList = {}): Promise<number>
	{
		const runner = this.runnerFactory.createRunner(project.root, command.command, environment);

		runner.onStart.subscribe((command) => {
			this.onCommandRun.emit({
				command: command,
				project: project,
			});
		});

		runner.onStdout.subscribe((chunk) => {
			this.onCommandStdout.emit({
				chunk: chunk,
				project: project,
			});
		});

		runner.onStderr.subscribe((chunk) => {
			this.onCommandStderr.emit({
				chunk: chunk,
				project: project,
			});
		});

		return runner.run();
	}

}
