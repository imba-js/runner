import {Project} from './project';
import {Script, ScriptDefinitionCallback} from './script';
import * as _ from 'lodash';


export class Imba
{


	private _projects: Array<Project> = [];

	private _scripts: Array<Script> = [];

	private _frozen: boolean = false;


	public getProjects(): Array<Project>
	{
		return this._projects;
	}


	public getProject(name: string): Project|undefined
	{
		for (let i = 0; i < this._projects.length; i++) {
			if (this._projects[i].name === name) {
				return this._projects[i];
			}
		}
	}


	public hasProject(name: string): boolean
	{
		return !_.isUndefined(this.getProject(name));
	}


	public project(name: string, root: string): Project
	{
		this.check();

		let project = new Project(name, root);
		this._projects.push(project);

		return project;
	}


	public getScripts(): Array<Script>
	{
		return this._scripts;
	}


	public getScript(name: string, need: boolean = false): Script|undefined
	{
		for (let i = 0; i < this._scripts.length; i++) {
			if (this._scripts[i].name === name) {
				return this._scripts[i];
			}
		}

		if (need) {
			throw new Error(`Script ${name} is not defined.`);
		}
	}


	public hasScript(name: string): boolean
	{
		return !_.isUndefined(this.getScript(name));
	}


	public script(name: string, definition: ScriptDefinitionCallback): Script
	{
		this.check();

		const script = new Script(this, name, definition);
		this._scripts.push(script);

		return script;
	}


	public loadScriptConfigurations(): void
	{
		for (let i = 0; i < this._scripts.length; i++) {
			this._scripts[i].loadConfiguration();
		}

		this._frozen = true;
	}


	private check(): void
	{
		if (this._frozen) {
			throw new Error('Can not modify frozen imba configuration');
		}
	}

}
