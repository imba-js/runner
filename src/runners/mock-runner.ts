import {Runner} from './runner';
import * as _ from 'lodash';


async function sleep(timeout: number): Promise<any>
{
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, timeout);
	});
}


export class MockRunner extends Runner
{


	public returnCode: number = 0;

	public stdout: Array<string> = [];

	public stderr: Array<string> = [];

	public timeout: number;


	public async run(): Promise<number>
	{
		this.onStart.emit(this.command);

		for (let i = 0; i < this.stdout.length; i++) {
			this.onStdout.emit(this.stdout[i]);
		}

		for (let i = 0; i < this.stderr.length; i++) {
			this.onStderr.emit(this.stderr[i]);
		}

		if (!_.isUndefined(this.timeout)) {
			await sleep(this.timeout);
		}

		this.onFinish.emit(this.returnCode);

		return this.returnCode;
	}

}
