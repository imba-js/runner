import {Project} from './project';
import {Script, ScriptDefinitionCallback} from './script';
import * as _ from 'lodash';


export class Imba
{


	public readonly __isImba: boolean = true;

	private _projects: Array<Project> = [];

	private _scripts: Array<Script> = [];


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
		let project = new Project(name, root);
		this._projects.push(project);

		return project;
	}


	public getScripts(): Array<Script>
	{
		return this._scripts;
	}


	public getScript(name: string): Script|undefined
	{
		for (let i = 0; i < this._scripts.length; i++) {
			if (this._scripts[i].name === name) {
				return this._scripts[i];
			}
		}
	}


	public hasScript(name: string): boolean
	{
		return !_.isUndefined(this.getScript(name));
	}


	public script(name: string, definition: ScriptDefinitionCallback): Script
	{
		const script = new Script(name, definition);
		this._scripts.push(script);

		return script;
	}

}
