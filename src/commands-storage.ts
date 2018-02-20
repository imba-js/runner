import {Command, CmdCommand, CallbackCommand, CallbackCommandCallback} from './commands';
import {RunnerFactory} from './runners';


export class CommandsStorage
{


	private _runnerFactory: RunnerFactory;

	private _commands: Array<Command> = [];


	constructor(runnerFactory: RunnerFactory)
	{
		this._runnerFactory = runnerFactory;
	}


	public cmd(command: string): CommandsStorage
	{
		const cmd = new CmdCommand(this._runnerFactory, command);
		this._commands.push(cmd);

		return this;
	}


	public callback(name: string, cb: CallbackCommandCallback): CommandsStorage
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
