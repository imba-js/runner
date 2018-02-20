import {EventEmitter} from '../event-emitter';
import {RunContext} from '../run-context';


export abstract class Command
{


	public readonly name: string;

	public onStart: EventEmitter<Command> = new EventEmitter<Command>();

	public onEnd: EventEmitter<number> = new EventEmitter<number>();

	public onStdout: EventEmitter<string> = new EventEmitter<string>();

	public onStderr: EventEmitter<string> = new EventEmitter<string>();


	constructor(name: string)
	{
		this.name = name;
	}


	public abstract run(ctx: RunContext): Promise<number>;

}
