#!/usr/bin/env node

import {NativeOutput, NativeReadline} from '@imba/stdio';
import {NativeChildProcessFactory} from '@imba/spawn';
import {configFileLookup, loadImbaFromFile} from './configuration';
import {InfoPrinter, ListPrinter} from './printers';
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
	.command('run', 'Run defined script', (yargs) => {
		yargs.option('dry', {default: false});
		return yargs;
	})
	.command('exec', 'Execute given command in specific project')
	.demandCommand()
	.help('h')
	.version(require('../package.json').version).describe('v', 'show installed version')
	.alias('h', 'help')
	.alias('v', 'version')
	.strict()
	.argv
;


const output = new NativeOutput;
const rl = new NativeReadline;
const reader = new NativeFileReader;
const childProcessFactory = new NativeChildProcessFactory;


function showError(message: string): void
{
	yargs.showHelp();
	output.log(message);
	process.exit(1);
}


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
const executor = new Executor(childProcessFactory, output, rl, imba);
const command = argv._[0];

imba.loadScriptConfigurations();


process.on('SIGINT', () => {
	executor.killRunning(() => {
		process.exit();
	});
});


switch (command) {
	case 'info': (new InfoPrinter(output)).printInfo(configFile, imba); break;
	case 'list': (new ListPrinter(output)).printList(imba); break;
	case 'run':
		if (_.isUndefined(argv._[1])) {
			showError(`Missing run script.`);
		}

		const scriptName = argv._[1];

		if (!imba.hasScript(scriptName)) {
			showError(`Script ${scriptName} is not defined.`);
		}

		const script = imba.getScript(scriptName);

		if (script.isHidden()) {
			showError(`Script ${scriptName} is hidden and can not be run from CLI directly.`);
		}

		executor.run(script, argv.dry).then((returnCode) => {
			process.exit(returnCode);
		});

		break;
	case 'exec':
		if (_.isUndefined(argv._[1])) {
			showError(`Missing project name.`);
		}

		const projectName = argv._[1];

		if (!imba.hasProject(projectName)) {
			showError(`Project ${projectName} is not defined.`);
		}

		const project = imba.getProject(projectName);
		const cmd = argv._.slice(2);

		executor.runProjectCommand(project, cmd.join(' ')).then((returnCode) => {
			process.exit(returnCode);
		});

		break;
}
