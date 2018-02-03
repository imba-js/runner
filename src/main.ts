import {readConfiguration} from './configuration';
import {printInfo, printRunner} from './printer';
import {SeriesScriptRunner} from './script-runners';
import * as yargs from 'yargs';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import chalk from 'chalk';


const argv = yargs
	.usage('Usage: $0 [options] <command>')
	.option('dir', {alias: 'd', default: process.cwd()})
	.command('info', 'Show information about all registered projects and scripts')
	.command('run', 'Run defined script')
	.demandCommand()
	.help('h')
	.alias('h', 'help')
	.strict()
	.argv
;


const dir: string = path.isAbsolute(argv.dir) ?
	argv.dir :
	path.resolve(argv.dir)
;

const configFile: string = path.join(dir, '.imba-runner.yml');


if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
	yargs.showHelp();
	console.log(`Directory ${dir} doesn't exists or is not a directory.`);
	process.exit(1);
}

if (!fs.existsSync(configFile) || !fs.statSync(configFile).isFile()) {
	yargs.showHelp();
	console.log(`Configuration file ${configFile} doesn't exists or is not a file.`);
	process.exit(1);
}


const config = readConfiguration(configFile);

switch (argv._[0]) {
	case 'info': printInfo(config); break;
	case 'run':
		if (_.isUndefined(argv._[1])) {
			console.log(`Missing run script.`);
			process.exit(1);
		}

		if (_.isUndefined(config.scripts[argv._[1]])) {
			console.log(`Script ${argv._[1]} is not defined.`);
			process.exit(1);
		}

		const runner = new SeriesScriptRunner(config);

		printRunner(runner);

		runner.runScript(argv._[1]).then((returnCode) => {
			const message = `Script ${argv._[1]} finished with return code ${returnCode}`;

			console.log('');
			console.log(!returnCode ? chalk.bold.bgGreen.black(message) : chalk.bold.bgRed(message));

			process.exit(returnCode);
		});

		break;
}
