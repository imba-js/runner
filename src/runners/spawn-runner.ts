import {spawn} from 'child_process';
import {Runner} from './runner';


export class SpawnRunner extends Runner
{


	public run(): Promise<number>
	{
		this.emit('start', this.command);

		return new Promise<number>((resolve) => {
			const child = spawn(this.command, [], {
				shell: true,
				cwd: this.root,
				env: this.environment,
			});

			child.stdout.on('data', (chunk: string) => {
				this.emit('stdout', chunk);
			});

			child.stderr.on('data', (chunk: string) => {
				this.emit('stderr', chunk);
			});

			child.on('close', (returnCode) => {
				this.emit('finish', returnCode);
				resolve(returnCode);
			});
		});
	}

}
