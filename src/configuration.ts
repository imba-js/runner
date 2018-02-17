import {FileReader} from './file-readers';
import {Imba} from './imba';
import * as path from 'path';


const allowedExtensions = ['.js', '.ts'];


export function configFileLookup(fileReader: FileReader, file: string): string|undefined
{
	if (fileReader.isFile(file)) {
		return file;
	}

	const ext = path.extname(file);

	if (ext !== '' && allowedExtensions.indexOf(ext) < 0) {
		return undefined;
	}

	for (let i = 0; i < allowedExtensions.length; i++) {
		let currentFile = `${file}${allowedExtensions[i]}`;

		if (fileReader.isFile(currentFile)) {
			return currentFile;
		}
	}

	return undefined;
}


export function loadImbaFromFile(fileReader: FileReader, file: string): Imba
{
	const exported = <Imba>fileReader.require(file);

	if (!exported.__isImba) {
		throw new Error(`${file} must export instance of Imba class.`);
	}

	return exported;
}
