export interface FileReader
{


	isFile(file: string): boolean;

	isDirectory(path: string): boolean;

	require(file: string): any;

}
