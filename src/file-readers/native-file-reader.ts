import {FileReader} from './file-reader';
import * as fs from 'fs';


export class NativeFileReader implements FileReader
{


	public readFile(file: string): string
	{
		return fs.readFileSync(file, {encoding: 'utf-8'});
	}


	public isDirectory(path: string): boolean
	{
		return fs.existsSync(path) && fs.statSync(path).isDirectory();
	}

}
