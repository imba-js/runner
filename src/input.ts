import {EnvList} from './environment-variable';


export declare interface InputOptions
{
	defaultValue?: string,
	required?: boolean,
}


export declare interface InputsList
{
	[scriptName: string]: Array<Input>,
}


export declare interface AnswersList
{
	[scriptName: string]: EnvList,
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
