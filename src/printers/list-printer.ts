import {Printer} from './printer';
import {Imba} from '../imba';
import * as pad from 'pad';
import chalk from 'chalk';


export class ListPrinter extends Printer
{


	public printList(imba: Imba): void
	{
		let longestName = 0;
		const scripts = imba.getScripts();

		for (let i = 0; i < scripts.length; i++) {
			if (scripts[i].isHidden()) {
				continue;
			}

			if (scripts[i].name.length > longestName) {
				longestName = scripts[i].name.length;
			}
		}

		for (let i = 0; i < scripts.length; i++) {
			if (scripts[i].isHidden()) {
				continue;
			}

			let line = chalk.magenta(scripts[i].name);

			if (scripts[i].hasDescription()) {
				let add = longestName - scripts[i].name.length + 1;
				line += pad(' ', add) + '- ';
				line += scripts[i].getDescription();
			}

			this.output.log(line);
		}
	}

}
