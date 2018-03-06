import {Output} from './output';
import * as readline from 'readline';


export class NativeOutput implements Output
{


	public log(message: string): void
	{
		console.log(message);
	}


	public stdout(message: string): void
	{
		process.stdout.write(message);
	}


	public stderr(message: string): void
	{
		process.stderr.write(message);
	}


	public cursorTo(x: number, y?: number): void
	{
		readline.cursorTo(process.stdout, x, y);
	}

}
