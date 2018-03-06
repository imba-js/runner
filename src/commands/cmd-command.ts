import {Command} from './command';
import {RunnerFactory, Runner} from '../runners';
import {RunContext} from '../run-context';
import {Imba} from '../imba';


export declare interface CmdCommandOptions
{
	killSignal?: string,
}


export class CmdCommand extends Command
{


	private runnerFactory: RunnerFactory;

	private cmd: string;

	private options: CmdCommandOptions;

	private currentRunner: Runner;


	constructor(imba: Imba, runnerFactory: RunnerFactory, cmd: string, options: CmdCommandOptions = {})
	{
		super(imba, cmd);

		this.runnerFactory = runnerFactory;
		this.cmd = cmd;
		this.options = options;
	}


	public async run(ctx: RunContext): Promise<number>
	{
		if (this.currentRunner) {
			this.onStderr.emit(`Command ${this.cmd} is already running.`);
			this.onEnd.emit(1);

			return 1;
		}

		const cmd = this.currentRunner = this.runnerFactory.createRunner(ctx.project.root, this.cmd, ctx.env);

		cmd.onStart.subscribe(() => this.onStart.emit(this));
		cmd.onFinish.subscribe((returnCode) => this.onEnd.emit(returnCode));
		cmd.onStdout.subscribe((chunk) => this.onStdout.emit(chunk));
		cmd.onStderr.subscribe((chunk) => this.onStderr.emit(chunk));

		const returnCode = await cmd.run();

		this.currentRunner = undefined;

		return returnCode;
	}


	public kill(overrideSignal: string = this.options.killSignal): void
	{
		super.kill(overrideSignal);

		if (this.currentRunner) {
			this.currentRunner.kill(overrideSignal);
		}
	}

}
