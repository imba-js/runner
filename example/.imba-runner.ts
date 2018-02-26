import {project, script, ScriptMode} from '../lib';
import * as path from 'path';


function sleep(ms): Promise<void>
{
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}


project('root', __dirname);
project('js:a', path.resolve(__dirname, 'js_a'));
project('js:b', path.resolve(__dirname, 'js_b'));
project('php:a', path.resolve(__dirname, 'php_a'));


script('hidden', (script) => {
	script.hide();
	script.describe('Hidden script');
});


script('project:install', (script) => {
	script.mode(ScriptMode.Series);
	script.only(['root']);
	script.input('USER_NAME', 'Please, enter your user name', {defaultValue: 'John Doe'});
	script.input('USER_EMAIL', 'Please, enter your user email', {required: true});
	script.describe('Automatic project installer');

	script.cmd('env');
});


script('deps:install', (script, ctx) => {
	script.mode(ScriptMode.Series);
	script.describe('Install all project dependencies');
	script.before((before) => {
		before.cmd('echo "Starting to install dependencies"');
	});
	script.after((after) => {
		after.cmd(`echo "Finished deps:install"`);
	});

	if (ctx.project.name === 'php:a') {
		script.cmd('echo "composer install"');
	} else {
		script.cmd('echo "yarn install"');
	}
});


script('run:dev', (script) => {
	script.mode(ScriptMode.Series);
	script.except(['root', 'js:b']);
	script.env('HOME', process.env.HOME);
	script.env('ENVIRONMENT', 'dev');
	script.describe('Start development version');

	script
		.cmd('env')
		.cmd('date')
		.cmd('exit 1')		// let's fail here
		.cmd('echo "invisible text"')
	;
});


script('run:prod', (script) => {
	script.mode(ScriptMode.Series);
	script.only(['js:a']);
	script.env('ENVIRONMENT', 'prod');
	script.describe('Start production version');
	script.before(['deps:install']);

	script
		.cmd('date')
		.cmd('uptime')
	;
});


script('work', (script) => {
	script.mode(ScriptMode.Series);

	script.cmd('echo "Working hard..."');
});


script('sleep:prepare', (script) => {
	script.before(['work']);
	script.before((before, ctx) => {
		before.cmd(`echo "Preparing to sleep on ${ctx.project.name}"`);
	});
	script.after((after, ctx) => {
		after.cmd(`echo "Prepared to sleep on ${ctx.project.name}"`);
	});

	script.cmd('sleep 1');
});


script('sleep', (script) => {
	script.before(['sleep:prepare']);
	script.before((before, ctx) => {
		before.cmd(`echo "Before sleep on ${ctx.project.name}"`);
	});
	script.after((after, ctx) => {
		after.cmd(`echo "After sleep on ${ctx.project.name}"`);
	});

	script.callback('sleep callback', async () => {
		await sleep(5000);
		return 0;
	});

	script.cmd('sleep 5');
});


script('child:c', (script) => {
	script.only(['root']);

	script.cmd('echo "Child:c"');
});


script('child:b', (script) => {
	script.only(['root']);

	script.cmd('echo "Child:b before"');
	script.run('child:c');
	script.cmd('echo "Child:b after"');
});


script('child:a', (script) => {
	script.only(['root']);

	script.cmd('echo "Child:a before"');
	script.run('child:b');
	script.cmd('echo "Child:a after"');
});


script('parent', (script) => {
	script.only(['root']);

	script.cmd('echo "Parent before"');
	script.run('child:a');
	script.cmd('echo "Parent after"');
});
