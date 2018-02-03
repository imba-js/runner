import {Output} from '../outputs';
import {ScriptRunner} from '../script-runners';


export abstract class ScriptPrinter
{


	protected output: Output;


	constructor(output: Output)
	{
		this.output = output;
	}


	public abstract enablePrinter(runner: ScriptRunner): void;

}
