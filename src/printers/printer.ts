import {Output} from '@imba/stdio';
import chalk from 'chalk';
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
		const columns = this.output.getColumns();
		this.output.log(chalk.bold.blue(_.repeat('=', columns)));
	}

}
