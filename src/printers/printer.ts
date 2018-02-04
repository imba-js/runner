import {Output} from '../outputs';
import chalk from 'chalk';
import * as termSize from 'term-size';
import * as _ from 'lodash';


export abstract class Printer
{


	protected output: Output;


	constructor(output: Output)
	{
		this.output = output;
	}


	protected printSeparator(): void
	{
		const width: number = termSize().columns;
		this.output.log(chalk.bold.blue(_.repeat('=', width)));
	}

}
