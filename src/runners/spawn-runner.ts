import {spawn} from 'child_process';
import {Runner} from './runner';


export class SpawnRunner extends Runner
{


	public async run(): Promise<number>
	{
		this.onStart.emit(this.command);

		return new Promise<number>((resolve) => {
			const child = spawn(this.command, [], {
				shell: true,
				cwd: this.root,
				env: this.environment,
			});

			child.stdout.on('data', (chunk: string) => {
				this.onStdout.emit(chunk);
			});

			child.stderr.on('data', (chunk: string) => {
				this.onStderr.emit(chunk);
			});

			child.on('close', (returnCode) => {
				this.onFinish.emit(returnCode);
				resolve(returnCode);
			});
		});
	}

}
