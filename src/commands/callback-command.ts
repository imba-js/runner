import {EventEmitter} from '@imba/event-emitter';
import {Command} from './command';
import {RunContext} from '../run-context';
import {Imba} from '../imba';
import * as _ from 'lodash';


export declare type CallbackCommandCallback = (ctx: RunContext, stdout: EventEmitter<string>, stderr: EventEmitter<string>) => number|Promise<number>|void;


export class CallbackCommand extends Command
{


	private cb: CallbackCommandCallback;


	constructor(imba: Imba, name: string, cb: CallbackCommandCallback)
	{
		super(imba, name);

		this.cb = cb;
	}


	public async run(ctx: RunContext): Promise<number>
	{
		this.onStart.emit(this);

		let code: number;

		try {
			code = await <number>this.cb(ctx, this.onStdout, this.onStderr);
		} catch (e) {
			this.onStderr.emit(e.toString());
			code = 1;
		}

		if (_.isUndefined(code)) {
			code = 0;
		}

		this.onEnd.emit(<number>code);

		return <number>code;
	}

}
