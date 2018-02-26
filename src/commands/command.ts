import {EventEmitter} from '../event-emitter';
import {RunContext} from '../run-context';
import {Input} from '../input';
import {Imba} from '../imba';


export abstract class Command
{


	public readonly name: string;

	public onStart: EventEmitter<Command> = new EventEmitter<Command>();

	public onEnd: EventEmitter<number> = new EventEmitter<number>();

	public onStdout: EventEmitter<string> = new EventEmitter<string>();

	public onStderr: EventEmitter<string> = new EventEmitter<string>();

	protected _imba: Imba;


	constructor(imba: Imba, name: string)
	{
		this._imba = imba;
		this.name = name;
	}


	public abstract run(ctx: RunContext): Promise<number>;


	public getInputs(): Array<Input>
	{
		return [];
	}

}
