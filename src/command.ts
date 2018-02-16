export declare interface CommandEnvList
{
	[name: string]: string,
}


export class Command
{


	public readonly command: string;


	constructor(command: string)
	{
		this.command = command;
	}

}
