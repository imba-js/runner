import {ScriptMode} from '../src';
import * as path from 'path';


imba.project('root', __dirname);
imba.project('js:a', path.resolve(__dirname, 'js_a'));
imba.project('js:b', path.resolve(__dirname, 'js_b'));
imba.project('php:a', path.resolve(__dirname, 'php_a'));


imba.script('project:install', (script) => {
	script.cmd('env');
})
	.mode(ScriptMode.Series)
	.only(['root'])
	.input('USER_NAME', 'Please, enter your user name', {defaultValue: 'John Doe'})
	.input('USER_EMAIL', 'Please, enter your user email', {required: true})
;


imba.script('deps:install', (script, ctx) => {
	if (ctx.project.name === 'php:a') {
		script.cmd('echo "composer install"');
	} else {
		script.cmd('echo "yarn install"');
	}
})
	.before((script) => {
		script.cmd('echo "Starting to install dependencies"');
	})
	.after((script, ctx) => {
		script.cmd(`echo "Return code from installation was ${ctx.scriptReturnCode}"`);
	})
	.mode(ScriptMode.Series)
;


imba.script('run:dev', (script) => {
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


imba.script('run:prod', (script) => {
	script
		.cmd('date')
		.cmd('uptime')
	;
})
	.mode(ScriptMode.Series)
	.only(['js:a'])
	.env('ENVIRONMENT', 'prod')
	.dependencies(['deps:install'])
;


imba.script('work', (script) => {
	script.cmd('echo "Working hard..."');
})
	.mode(ScriptMode.Series)
;


imba.script('sleep:prepare', (script) => {
	script.cmd('sleep 1');
})
	.before((script, ctx) => {
		script.cmd(`echo "Preparing to sleep on ${ctx.project.name}"`);
	})
	.after((script, ctx) => {
		script.cmd(`echo "Prepared to sleep on ${ctx.project.name}"`);
	})
	.dependencies(['work'])
;


imba.script('sleep', (script) => {
	script.cmd('sleep 5');
})
	.before((script, ctx) => {
		script.cmd(`echo "Before sleep on ${ctx.project.name}"`);
	})
	.after((script, ctx) => {
		script.cmd(`echo "After sleep on ${ctx.project.name}"`);
	})
	.dependencies(['sleep:prepare'])
;
