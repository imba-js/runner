import {Imba} from './imba';
import {Project} from './project';
import {Script, ScriptDefinitionCallback} from './script';


const _imba = new Imba;


export const imba: Imba = _imba;


export function project(name: string, root: string): Project
{
	return _imba.project(name, root);
}


export function script(name: string, definition: ScriptDefinitionCallback): Script
{
	return _imba.script(name, definition);
}
