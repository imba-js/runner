import {Output} from '../outputs';
import chalk from 'chalk';
import * as termSize from 'term-size';
import * as _ from 'lodash';


export function printSeparator(output: Output): void
{
	const width: number = termSize().columns;
	output.log(chalk.bold.blue(_.repeat('=', width)));
}
