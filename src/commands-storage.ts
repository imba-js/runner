import {Command, CmdCommand} from './commands';
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
		const _cmd = new CmdCommand(this._runnerFactory, command);
		this._commands.push(_cmd);

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
