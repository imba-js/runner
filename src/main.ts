#!/usr/bin/env node

import {configFileLookup, loadImbaFromFile} from './configuration';
import {SpawnRunnerFactory} from './runners';
import {InfoPrinter, ListPrinter} from './printers';
import {NativeOutput} from './outputs';
import {NativeFileReader} from './file-readers';
import {Executor} from './executor';
import * as yargs from 'yargs';
import * as path from 'path';
import * as _ from 'lodash';


const argv = yargs
	.usage('Usage: $0 [options] <command>')
	.option('config', {alias: 'c', default: `${process.cwd()}/.imba-runner`})
	.command('info', 'Show information about all registered projects and scripts')
	.command('list', 'Print all available scripts')
	.command('run', 'Run defined script')
	.command('exec', 'Execute given command in specific project')
	.demandCommand()
	.help('h')
	.version(require('../package.json').version).describe('v', 'show installed version')
	.alias('h', 'help')
	.alias('v', 'version')
	.strict()
	.argv
;


function showError(message: string): void
{
	yargs.showHelp();
	output.log(message);
	process.exit(1);
}


const output = new NativeOutput;
const reader = new NativeFileReader;
const runnerFactory = new SpawnRunnerFactory;


let configFile: string = path.isAbsolute(argv.config) ?
	argv.config :
	path.resolve(argv.config)
;

configFile = configFileLookup(reader, configFile);


if (!configFile) {
	showError(`Configuration file ${argv.config} doesn't exists or is not a file.`);
}

if (path.extname(configFile) === '.ts') {
	require('ts-node').register();
}


const imba = loadImbaFromFile(reader, configFile);
const executor = new Executor(runnerFactory, output, imba);

imba.loadScriptConfigurations();


switch (argv._[0]) {
	case 'info': (new InfoPrinter(output)).printInfo(configFile, imba); break;
	case 'list': (new ListPrinter(output)).printList(imba); break;
	case 'run':
		if (_.isUndefined(argv._[1])) {
			showError(`Missing run script.`);
		}

		if (!imba.hasScript(argv._[1])) {
			showError(`Script ${argv._[1]} is not defined.`);
		}

		const script = imba.getScript(argv._[1]);

		if (script.isHidden()) {
			showError(`Script ${argv._[1]} is hidden and can not be run from CLI directly.`);
		}

		executor.run(script).then((returnCode) => {
			process.exit(returnCode);
		});

		break;
	case 'exec':
		if (_.isUndefined(argv._[1])) {
			showError(`Missing project name.`);
		}

		if (!imba.hasProject(argv._[1])) {
			showError(`Project ${argv._[1]} is not defined.`);
		}

		const project = imba.getProject(argv._[1]);
		const command = argv._.slice(2);

		executor.runProjectCommand(project, command.join(' ')).then((returnCode) => {
			process.exit(returnCode);
		});

		break;
}
