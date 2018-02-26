import {Command, CmdCommand, CallbackCommand, CallbackCommandCallback} from './commands';
import {RunnerFactory} from './runners';
import {Script, ScriptMode, ScriptDefinitionCallback} from './script';
import {InputOptions} from './input';


export class ScriptContext
{


	private _runnerFactory: RunnerFactory;

	private _script: Script;

	private _commands: Array<Command> = [];


	constructor(runnerFactory: RunnerFactory, script: Script)
	{
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


	public before(scriptOrDefinition: ScriptDefinitionCallback|string|Array<string>): ScriptContext
	{
		this._script.before(scriptOrDefinition);
		return this;
	}


	public after(scriptOrDefinition: ScriptDefinitionCallback|string|Array<string>): ScriptContext
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


	public cmd(command: string): ScriptContext
	{
		const cmd = new CmdCommand(this._runnerFactory, command);
		this._commands.push(cmd);

		return this;
	}


	public callback(name: string, cb: CallbackCommandCallback): ScriptContext
	{
		const cmd = new CallbackCommand(name, cb);
		this._commands.push(cmd);

		return this;
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
