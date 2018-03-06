import {RunnerFactory} from '../runners';
import {Command} from '../commands';
import {ScriptContext} from '../script-context';
import {Project} from '../project';
import {Script} from '../script';
import {EventEmitter} from '../event-emitter';
import {RunContext, RunState} from '../run-context';
import {createScriptEnvironment, EnvList} from '../environment-variable';


export declare interface ScriptCommandStartArg
{
	project: Project,
	command: Command,
}


export declare interface ScriptCommandFinishArg
{
	project: Project,
	command: Command,
	returnCode: number,
}


export declare interface ScriptCommandOutputArg
{
	project: Project,
	command: Command,
	chunk: string,
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

	public onCommandFinish: EventEmitter<ScriptCommandFinishArg> = new EventEmitter<ScriptCommandFinishArg>();

	public onCommandStdout: EventEmitter<ScriptCommandOutputArg> = new EventEmitter<ScriptCommandOutputArg>();

	public onCommandStderr: EventEmitter<ScriptCommandOutputArg> = new EventEmitter<ScriptCommandOutputArg>();

	private runnerFactory: RunnerFactory;


	constructor(runnerFactory: RunnerFactory)
	{
		this.runnerFactory = runnerFactory;
	}


	public async runScript(projects: Array<Project>, script: Script, inputAnswers: EnvList = {}, dry: boolean = false): Promise<number>
	{
		this.onStart.emit(script.name);
		const returnCode = await this.doRunScript(projects, script, inputAnswers, dry);
		this.onEnd.emit(returnCode);

		return returnCode;
	}


	public async runProjectScript(project: Project, script: Script, inputAnswers: EnvList, dry: boolean = false): Promise<number>
	{
		const scriptName = script.name;
		const scriptEnvironment = script.getEnvs();
		const projectName = project.name;

		this.onProjectStart.emit({
			project: project,
			script: script,
		});

		const ctx = new RunContext(RunState.Run, project, createScriptEnvironment(scriptEnvironment, inputAnswers, {
			IMBA_SCRIPT_NAME: scriptName,
			IMBA_SCRIPT_TYPE_NAME: 'script',
			IMBA_PROJECT_NAME: projectName,
		}), inputAnswers);

		const returnCode = await this.runScriptStack(project, script.createScriptContext(this.runnerFactory, ctx), ctx, dry);

		this.onProjectEnd.emit({
			project: project,
			script: script,
		});

		return returnCode;
	}


	protected abstract async doRunScript(projects: Array<Project>, script: Script, inputAnswers: EnvList, dry: boolean): Promise<number>;


	private async runScriptStack(project: Project, scriptCtx: ScriptContext, ctx: RunContext, dry: boolean): Promise<number>
	{
		const _commands = scriptCtx.getCommands();
		let returnCode = 0;

		for (let i = 0; i < _commands.length; i++) {
			returnCode = await this.runCommand(project, _commands[i], ctx, dry);

			if (returnCode > 0) {
				return returnCode;
			}
		}

		return returnCode;
	}


	private async runCommand(project: Project, command: Command, ctx: RunContext, dry: boolean): Promise<number>
	{
		if (dry) {
			this.onCommandRun.emit({
				project: project,
				command: command,
			});

			this.onCommandFinish.emit({
				project: project,
				command: command,
				returnCode: 0,
			});

			return 0;
		}

		command.onStart.subscribe(() => {
			this.onCommandRun.emit({
				project: project,
				command: command,
			});
		});

		command.onStdout.subscribe((chunk) => {
			this.onCommandStdout.emit({
				project: project,
				command: command,
				chunk: chunk,
			});
		});

		command.onStderr.subscribe((chunk) => {
			this.onCommandStderr.emit({
				project: project,
				command: command,
				chunk: chunk,
			});
		});

		command.onEnd.subscribe((returnCode) => {
			this.onCommandFinish.emit({
				project: project,
				command: command,
				returnCode: returnCode,
			});
		});

		return command.run(ctx);
	}

}
