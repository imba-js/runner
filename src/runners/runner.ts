import {EventEmitter} from 'events';
import {ImbaEnvironmentScriptConfiguration} from '../definitions';


export abstract class Runner extends EventEmitter
{


	protected root: string;

	protected command: string;

	protected environment: ImbaEnvironmentScriptConfiguration;


	constructor(root: string, command: string, environment: ImbaEnvironmentScriptConfiguration)
	{
		super();

		this.root = root;
		this.command = command;
		this.environment = environment;
	}


	public abstract run(): Promise<number>;

}
