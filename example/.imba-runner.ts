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


script('hidden', () => {})
	.hide();


script('project:install', (script) => {
	script.cmd('env');
})
	.mode(ScriptMode.Series)
	.only(['root'])
	.input('USER_NAME', 'Please, enter your user name', {defaultValue: 'John Doe'})
	.input('USER_EMAIL', 'Please, enter your user email', {required: true})
;


script('deps:install', (script, ctx) => {
	if (ctx.project.name === 'php:a') {
		script.cmd('echo "composer install"');
	} else {
		script.cmd('echo "yarn install"');
	}
})
	.before((script) => {
		script.cmd('echo "Starting to install dependencies"');
	})
	.after((script) => {
		script.cmd(`echo "Finished deps:install"`);
	})
	.mode(ScriptMode.Series)
;


script('run:dev', (script) => {
	script
		.cmd('env')
		.cmd('date')
		.cmd('exit 1')		// let's fail here
		.cmd('echo "invisible text"')
	;
})
	.mode(ScriptMode.Series)
	.except(['root', 'js:b'])
	.env('HOME', process.env.HOME)
	.env('ENVIRONMENT', 'dev')
;


script('run:prod', (script) => {
	script
		.cmd('date')
		.cmd('uptime')
	;
})
	.before(['deps:install'])
	.mode(ScriptMode.Series)
	.only(['js:a'])
	.env('ENVIRONMENT', 'prod')
;


script('work', (script) => {
	script.cmd('echo "Working hard..."');
})
	.mode(ScriptMode.Series)
;


script('sleep:prepare', (script) => {
	script.cmd('sleep 1');
})
	.before(['work'])
	.before((script, ctx) => {
		script.cmd(`echo "Preparing to sleep on ${ctx.project.name}"`);
	})
	.after((script, ctx) => {
		script.cmd(`echo "Prepared to sleep on ${ctx.project.name}"`);
	})
;


script('sleep', (script) => {
	script.callback('sleep callback', async () => {
		await sleep(5000);
		return 0;
	});

	script.cmd('sleep 5');
})
	.before(['sleep:prepare'])
	.before((script, ctx) => {
		script.cmd(`echo "Before sleep on ${ctx.project.name}"`);
	})
	.after((script, ctx) => {
		script.cmd(`echo "After sleep on ${ctx.project.name}"`);
	})
;
