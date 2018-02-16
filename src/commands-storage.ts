import {Command} from './command';


export class CommandsStorage
{


	private _commands: Array<Command> = [];


	public cmd(command: string): CommandsStorage
	{
		const cmd = new Command(command);
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
