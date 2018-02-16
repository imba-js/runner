import {FileReader} from './file-reader';
import * as _ from 'lodash';


export class MockFileReader implements FileReader
{


	public files: {[name: string]: string} = {};

	public directories: Array<string> = [];


	public isFile(file: string): boolean
	{
		return !_.isUndefined(this.files[file]);
	}


	public isDirectory(path: string): boolean
	{
		return this.directories.indexOf(path) >= 0;
	}

}
