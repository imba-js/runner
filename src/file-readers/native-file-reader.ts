import {FileReader} from './file-reader';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';


export class NativeFileReader implements FileReader
{


	private _registeredTs: boolean = false;


	public isFile(file: string): boolean
	{
		return fs.existsSync(file) && fs.statSync(file).isFile();
	}


	public isDirectory(path: string): boolean
	{
		return fs.existsSync(path) && fs.statSync(path).isDirectory();
	}


	public require(file: string, globalScope: any = {}): any
	{
		if (path.extname(file) === '.ts' && !this._registeredTs) {
			require('ts-node').register();
			this._registeredTs = true;
		}

		// todo: is there any better way?
		_.forEach(globalScope, (value: any, name: string) => {
			global[name] = value;
		});

		const exported = require(file);

		_.forEach(globalScope, (value: any, name: string) => {
			delete global[name];
		});

		return exported;
	}

}
