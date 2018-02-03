import {readConfiguration} from './configuration';
import {SpawnRunnerFactory} from './runners';
import {ScriptRunner, SeriesScriptRunner, ParallelScriptRunner} from './script-runners';
import {InfoPrinter, ScriptPrinter, SeriesScriptPrinter, ParallelScriptPrinter} from './printers';
import {NativeOutput} from './outputs';
import {ImbaScriptConfiguration, ImbaScriptMode} from './definitions';
import {MainRunner} from './main-runner';
import * as yargs from 'yargs';
import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';


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

const output = new NativeOutput;
const runnerFactory = new SpawnRunnerFactory;
const configFile: string = path.join(dir, '.imba-runner.yml');


if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
	yargs.showHelp();
	output.log(`Directory ${dir} doesn't exists or is not a directory.`);
	process.exit(1);
}

if (!fs.existsSync(configFile) || !fs.statSync(configFile).isFile()) {
	yargs.showHelp();
	output.log(`Configuration file ${configFile} doesn't exists or is not a file.`);
	process.exit(1);
}


const config = readConfiguration(configFile);
const runner = new MainRunner(runnerFactory, output, config);


switch (argv._[0]) {
	case 'info': (new InfoPrinter(output)).printInfo(config); break;
	case 'run':
		if (_.isUndefined(argv._[1])) {
			output.log(`Missing run script.`);
			process.exit(1);
		}

		if (_.isUndefined(config.scripts[argv._[1]])) {
			output.log(`Script ${argv._[1]} is not defined.`);
			process.exit(1);
		}

		const script = config.scripts[argv._[1]];

		runner.run(script).then((returnCode) => {
			process.exit(returnCode);
		});

		break;
}
