export interface Output
{


	log(message: string): void;

	stdout(message: string): void;

	stderr(message: string): void;

	cursorTo(x: number, y?: number): void;

}
