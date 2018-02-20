import {Command} from './command';
import {RunnerFactory} from '../runners';
import {RunContext} from '../run-context';


export class CmdCommand extends Command
{


	private runnerFactory: RunnerFactory;

	private cmd: string;


	constructor(runnerFactory: RunnerFactory, cmd: string)
	{
		super(cmd);

		this.runnerFactory = runnerFactory;
		this.cmd = cmd;
	}


	public run(ctx: RunContext): Promise<number>
	{
		const cmd = this.runnerFactory.createRunner(ctx.project.root, this.cmd, ctx.env);

		cmd.onStart.subscribe(() => this.onStart.emit(this));
		cmd.onFinish.subscribe((returnCode) => this.onEnd.emit(returnCode));
		cmd.onStdout.subscribe((chunk) => this.onStdout.emit(chunk));
		cmd.onStderr.subscribe((chunk) => this.onStderr.emit(chunk));

		return cmd.run();
	}

}
