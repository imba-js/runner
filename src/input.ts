export declare interface InputOptions
{
	defaultValue?: string,
	required?: boolean,
}


export class Input
{


	public readonly name: string;

	public readonly question: string;

	public defaultValue: string|undefined;

	public required: boolean = false;


	constructor(name: string, question: string)
	{
		this.name = name;
		this.question = question;
	}

}
