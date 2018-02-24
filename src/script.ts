import {CommandsStorage} from './commands-storage';
import {Input, InputOptions} from './input';
import {EnvironmentVariable} from './environment-variable';
import {RunContext} from './run-context';
import {RunnerFactory} from './runners';
import {Project} from './project';
import {Imba} from './imba';
import * as _ from 'lodash';


export declare type ScriptDefinitionCallback = (storage: CommandsStorage, context: RunContext) => void;

export enum ScriptMode
{
	Series = 'series',
	Parallel = 'parallel',
}


export class Script
{


	public readonly name: string;

	private _definition: ScriptDefinitionCallback;

	private _mode: ScriptMode = ScriptMode.Parallel;

	private _only: Array<string> = [];

	private _except: Array<string> = [];

	private _before: ScriptDefinitionCallback;

	private _after: ScriptDefinitionCallback;

	private _inputs: Array<Input> = [];

	private _env: Array<EnvironmentVariable> = [];

	private _dependencies: Array<string> = [];

	private _hidden: boolean = false;


	constructor(name: string, definition: ScriptDefinitionCallback)
	{
		this.name = name;
		this._definition = definition;
	}


	public getMode(): ScriptMode
	{
		return this._mode;
	}


	public mode(mode: ScriptMode): Script
	{
		this._mode = mode;
		return this;
	}


	public only(only: Array<string>): Script
	{
		this._only = only;
		return this;
	}


	public except(except: Array<string>): Script
	{
		this._except = except;
		return this;
	}


	public hasBeforeDefinition(): boolean
	{
		return !_.isUndefined(this._before);
	}


	public before(definition: ScriptDefinitionCallback): Script
	{
		this._before = definition;
		return this;
	}


	public hasAfterDefinition(): boolean
	{
		return !_.isUndefined(this._after);
	}


	public after(definition: ScriptDefinitionCallback): Script
	{
		this._after = definition;
		return this;
	}


	public hasInputs(): boolean
	{
		return this._inputs.length > 0;
	}


	public getInputs(): Array<Input>
	{
		return this._inputs;
	}


	public input(name: string, question: string, options: InputOptions = {}): Script
	{
		const input = new Input(name, question);

		if (!_.isUndefined(options.defaultValue)) {
			input.defaultValue = options.defaultValue;
		}

		if (!_.isUndefined(options.required)) {
			input.required = options.required;
		}

		this._inputs.push(input);

		return this;
	}


	public hasEnvs(): boolean
	{
		return this._env.length > 0;
	}


	public getEnvs(): Array<EnvironmentVariable>
	{
		return this._env;
	}


	public env(name: string, value: string): Script
	{
		const env = new EnvironmentVariable(name, value);
		this._env.push(env);

		return this;
	}


	public hasDependencies(): boolean
	{
		return this._dependencies.length > 0;
	}


	public getDependencies(): Array<string>
	{
		return this._dependencies;
	}


	public getRecursiveScriptDependencies(imba: Imba): Array<Script>
	{
		return this._getRecursiveScriptDependencies(imba, []);
	}


	public dependencies(dependencies: Array<string>): Script
	{
		this._dependencies = dependencies;
		return this;
	}


	public getAllowedProjects(imba: Imba): Array<Project>
	{
		const projects = imba.getProjects();
		const result: Array<Project> = [];

		for (let i = 0; i < projects.length; i++) {
			let project = projects[i];

			if (this._except.indexOf(project.name) >= 0) {
				continue;
			}

			if (this._only.length > 0 && this._only.indexOf(project.name) < 0) {
				continue;
			}

			result.push(project);
		}

		return result;
	}


	public createBeforeCommands(runnerFactory: RunnerFactory, ctx: RunContext): CommandsStorage
	{
		const storage = new CommandsStorage(runnerFactory);

		if (this._before) {
			this._before(storage, ctx);
		}

		return storage;
	}


	public createAfterCommands(runnerFactory: RunnerFactory, ctx: RunContext): CommandsStorage
	{
		const storage = new CommandsStorage(runnerFactory);

		if (this._after) {
			this._after(storage, ctx);
		}

		return storage;
	}


	public createCommands(runnerFactory: RunnerFactory, ctx: RunContext): CommandsStorage
	{
		const storage = new CommandsStorage(runnerFactory);
		this._definition(storage, ctx);

		return storage;
	}


	public hide(): Script
	{
		this._hidden = true;
		return this;
	}


	public isHidden(): boolean
	{
		return this._hidden;
	}


	private _getRecursiveScriptDependencies(imba: Imba, stack: Array<string>): Array<Script>
	{
		if (stack.indexOf(this.name) >= 0) {
			throw new Error(`Script ${this.name} contains circular dependency: ${stack.join(', ')}.`);
		}

		stack.push(this.name);

		let dependencies: Array<Script> = [];

		for (let i = 0; i < this._dependencies.length; i++) {
			let dependency = this._dependencies[i];

			if (!imba.hasScript(dependency)) {
				throw new Error(`Script ${this.name} depends on script ${dependency} which is not defined.`);
			}

			let script = imba.getScript(dependency);

			dependencies.push(script);
			dependencies = dependencies.concat(script._getRecursiveScriptDependencies(imba, stack));
		}

		return dependencies;
	}

}
