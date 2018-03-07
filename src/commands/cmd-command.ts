import {ChildProcessFactory, ChildProcess} from '@imba/spawn';
import {Command} from './command';
import {RunContext} from '../run-context';
import {Imba} from '../imba';


export declare interface CmdCommandOptions
{
	killSignal?: string,
}


export class CmdCommand extends Command
{


	private childProcessFactory: ChildProcessFactory;

	private cmd: string;

	private options: CmdCommandOptions;

	private currentChildProcess: ChildProcess;


	constructor(imba: Imba, childProcessFactory: ChildProcessFactory, cmd: string, options: CmdCommandOptions = {})
	{
		super(imba, cmd);

		this.childProcessFactory = childProcessFactory;
		this.cmd = cmd;
		this.options = options;
	}


	public async run(ctx: RunContext): Promise<number>
	{
		if (this.currentChildProcess) {
			this.onStderr.emit(`Command ${this.cmd} is already running.`);
			this.onEnd.emit(1);

			return 1;
		}

		const cmd = this.currentChildProcess = this.childProcessFactory.create(ctx.project.root, this.cmd, ctx.env);

		cmd.onStart.subscribe(() => this.onStart.emit(this));
		cmd.onFinish.subscribe((returnCode) => this.onEnd.emit(returnCode));
		cmd.onStdout.subscribe((chunk) => this.onStdout.emit(chunk));
		cmd.onStderr.subscribe((chunk) => this.onStderr.emit(chunk));

		const returnCode = await cmd.run();

		this.currentChildProcess = undefined;

		return returnCode;
	}


	public kill(overrideSignal: string = this.options.killSignal): void
	{
		super.kill(overrideSignal);

		if (this.currentChildProcess) {
			this.currentChildProcess.kill(overrideSignal);
		}
	}

}
