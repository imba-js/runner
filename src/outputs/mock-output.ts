import {Output} from './output';


export class MockOutput implements Output
{


	public _log: Array<string> = [];

	public _stdout: Array<string> = [];

	public _stderr: Array<string> = [];


	public log(message: string): void
	{
		this._log.push(message);
	}


	public stdout(message: string): void
	{
		this._stdout.push(message);
	}


	public stderr(message: string): void
	{
		this._stderr.push(message);
	}


	public cursorTo(x: number, y?: number): void
	{
	}

}
