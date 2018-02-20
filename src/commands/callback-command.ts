import {Command} from './command';
import {RunContext} from '../run-context';
import {EventEmitter} from '../event-emitter';
import * as _ from 'lodash';


export declare type CallbackCommandCallback = (ctx: RunContext, stdout: EventEmitter<string>, stderr: EventEmitter<string>) => number|Promise<number>|void;


export class CallbackCommand extends Command
{


	private cb: CallbackCommandCallback;


	constructor(name: string, cb: CallbackCommandCallback)
	{
		super(name);

		this.cb = cb;
	}


	public async run(ctx: RunContext): Promise<number>
	{
		this.onStart.emit(this);

		let code = await this.cb(ctx, this.onStdout, this.onStderr);

		if (_.isUndefined(code)) {
			code = 0;
		}

		this.onEnd.emit(<number>code);

		return <number>code;
	}

}
