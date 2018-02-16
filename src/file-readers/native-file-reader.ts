import {FileReader} from './file-reader';
import * as fs from 'fs';


export class NativeFileReader implements FileReader
{


	public isFile(file: string): boolean
	{
		return fs.existsSync(file) && fs.statSync(file).isFile();
	}


	public isDirectory(path: string): boolean
	{
		return fs.existsSync(path) && fs.statSync(path).isDirectory();
	}

}
