import {Command, CmdCommand, CallbackCommand, CallbackCommandCallback, RunCommand} from './commands';
import {RunnerFactory} from './runners';
import {Script, ScriptMode, ScriptOrDefinitionCallback} from './script';
import {InputOptions} from './input';
import {Imba} from './imba';


export class ScriptContext
{


	private _imba: Imba;

	private _runnerFactory: RunnerFactory;

	private _script: Script;

	private _commands: Array<Command> = [];


	constructor(imba: Imba, runnerFactory: RunnerFactory, script: Script)
	{
		this._imba = imba;
		this._runnerFactory = runnerFactory;
		this._script = script;
	}


	public describe(description: string): ScriptContext
	{
		this._script.describe(description);
		return this;
	}


	public mode(mode: ScriptMode): ScriptContext
	{
		this._script.mode(mode);
		return this;
	}


	public only(only: Array<string>): ScriptContext
	{
		this._script.only(only);
		return this;
	}


	public except(except: Array<string>): ScriptContext
	{
		this._script.except(except);
		return this;
	}


	public before(scriptOrDefinition: ScriptOrDefinitionCallback): ScriptContext
	{
		this._script.before(scriptOrDefinition);
		return this;
	}


	public after(scriptOrDefinition: ScriptOrDefinitionCallback): ScriptContext
	{
		this._script.after(scriptOrDefinition);
		return this;
	}


	public input(name: string, question: string, options: InputOptions = {}): ScriptContext
	{
		this._script.input(name, question, options);
		return this;
	}


	public env(name: string, value: string): ScriptContext
	{
		this._script.env(name, value);
		return this;
	}


	public hide(): ScriptContext
	{
		this._script.hide();
		return this;
	}


	public addCommand(cmd: Command): ScriptContext
	{
		this._commands.push(cmd);
		return this;
	}


	public cmd(command: string): ScriptContext
	{
		return this.addCommand(new CmdCommand(this._imba, this._runnerFactory, command));
	}


	public callback(name: string, cb: CallbackCommandCallback): ScriptContext
	{
		return this.addCommand(new CallbackCommand(this._imba, name, cb));
	}


	public run(script: string): ScriptContext
	{
		return this.addCommand(new RunCommand(this._imba, this._runnerFactory, script));
	}


	public isEmpty(): boolean
	{
		return this._commands.length === 0;
	}


	public getCommands(): Array<Command>
	{
		return this._commands;
	}

}
