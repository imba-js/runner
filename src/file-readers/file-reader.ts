export interface FileReader
{


	readFile(file: string): string;

	isDirectory(path: string): boolean;

}
