import {EventEmitter as BaseEventEmitter} from 'events';


const INTERNAL_EVENT_NAME = '__event';


export class EventEmitter<T>
{


	private _emitter: BaseEventEmitter = new BaseEventEmitter;


	public emit(arg?: T): void
	{
		this._emitter.emit(INTERNAL_EVENT_NAME, arg);
	}


	public subscribe(listener: (arg: T) => void): void
	{
		this._emitter.addListener(INTERNAL_EVENT_NAME, listener);
	}

}
