[![Build Status](https://img.shields.io/travis/imba-runner/imba-runner.svg?style=flat-square)](https://travis-ci.org/imba-runner/imba-runner)

# imba-runner

`imba` command allows you to easily manage and run shell commands in your monolithic repository.

It's almost as if some parts of `gulp`, `deployer php`, `docker-compose.yml`, `.gitlab-ci.yml` and `package.json` files 
had sex and this was their child.

## Example of PHP and JS app

**`.imba-runner.js`:**

```javascript
const Imba = require('@imba/runner');

Imba.project('api', './modules/api');
Imba.project('front', './modules/front');

Imba.script('deps:install', function(script, ctx) {
    if (ctx.project.name === 'api') {
        script.cmd('composer install');
    } else {
        script.cmd('yarn install');
    }
});

Imba.script('build', function(script) {
    script.cmd('yarn run build');
}).only(['front']);

Imba.script('up', function(script) {
    script.cmd('docker-compose up');
});

Imba.script('down', function(script) {
    script.cmd('docker-compose down');
});
```

Now you can run for example the `build` script like this:

```bash
$ imba run build
```

## Benefits

* Wrap difficult and long commands into easy to remember script
* Create list of all your scripts so each developer knows about them
* Execute many commands with just one script

## Installation

```bash
$ npm install -g @imba/runner
```

or with yarn

```bash
$ yarn global add @imba/runner
```

Next create new `.imba-runner.js` file in the root of your monolithic repository.

## Projects

This is just a simple definition with all of your projects and their paths.

```javascript
Imba.project('a', './a');
Imba.project('b', './b');
```

## Scripts

Now you must define all your scripts. As you could see in the example above, you could use current run context to 
determine which command you actually want to run.

You can also say to run your script only for some projects or to exclude some others.

```javascript
Imba.script('a', function(script) {
    script.cmd('echo "Run first command in script a"');
    script.cmd('echo "Run second command in script a"');
    script.cmd('echo "Run third command in script a"');
});

Imba.script('b', function(script, ctx) {
    if (ctx.project.name === 'a') {
        script.cmd('echo "Run script b in project a"');
    } else {
        script.cmd('echo "Run script b in project b"');
    }
});

Imba.script('c', function(script) {
    script.cmd('echo "Run script c only in project a"');
}).only(['a']);

Imba.script('d', function(script) {
    script.cmd('echo "Run script d in all projects, except for a"');
}).except(['a']);
```

## Use JS callbacks instead of CLI commands

```javascript
Imba.script('a', function(script) {
    script.callback('hello', function(ctx, stdout, stderr) {
        stdout.emit('hello world');
        stderr.emit(' from hell');
    });
});
``` 

Callbacks and CLI commands can be of course combined together.

## Run script before or after

Just like in for example`.gitlab-ci.yml` file or in `deployer`, you can define special scripts to run before or after 
the main scripts.

```javascript
Imba.script('a', function(script) {
    script.cmd('echo "Running script a"');
}).before(function(script) {
    script.cmd('echo "Running before script for script a"');
}).after(function(script) {
    script.cmd('echo "Running after script for script a"');
});
```

**These `before` and `after` commands are called always when they're defined. Even if the main `script` fails.**

## Environment variables

Imba-runner automatically adds some environment variables to your scripts.

```javascript
Imba.script('a', function(script) {
    script.cmd('echo ${IMBA_SCRIPT_NAME}');        // output: a
    script.cmd('echo ${IMBA_SCRIPT_TYPE_NAME}');   // output: before_script
    script.cmd('echo ${IMBA_PROJECT_NAME}');       // output: currently running project
}).before(function(script) {
    script.cmd('echo ${IMBA_SCRIPT_NAME}');        // output: a
    script.cmd('echo ${IMBA_SCRIPT_TYPE_NAME}');   // output: script
    script.cmd('echo ${IMBA_PROJECT_NAME}');       // output: currently running project
}).after(function(script) {
    script.cmd('echo ${IMBA_SCRIPT_RETURN_CODE}'); // output: return code from last command in script
    script.cmd('echo ${IMBA_SCRIPT_NAME}');        // output: a
    script.cmd('echo ${IMBA_SCRIPT_TYPE_NAME}');   // output: before_script
    script.cmd('echo ${IMBA_PROJECT_NAME}');       // output: currently running project
});
```

New custom environment variables could be also added.

```javascript
Imba.script('deploy', function(script) {
    script.cmd('echo "deploying ${STAGE} to ${URL}"');
}).env('URL', 'example.com')
    .env('STAGE', 'beta');
```

You have to keep in mind, that no environment variables from your current process are passed into the scripts. The only 
exception to this is `PATH` variable which is passed automatically when available.

If you want to pass some other environment variables into your scripts, you need to mention them specifically:

```javascript
Imba.script('deploy', function(script) {
    script.cmd('echo "deploying ${STAGE} to ${URL}"');
}).env('HOME', process.env.HOME);
```

### Inputs - ask questions in CLI

It wouldn't be really good to use custom environments for too many things. Especially for dynamic things read from CLI 
input.

Luckily there is a `inputs` configuration for scripts which are using the `stdin` from your terminal to read the input 
from your keyboard.

```javascript
Imba.script('git:configure', function(script) {
    script.cmd('git config --global user.name ${USER_NAME}');
    script.cmd('git config --global user.email ${USER_EMAIL}');
}).input('USER_NAME', 'Your name?', {defaultValue: 'John Doe'})
    .input('USER_EMAIL', 'Your email?', {required: true});
```

Now before imba-runner executes the actual script, it'll ask you two questions: what is your name and email. After you 
provide your answer, it'll run the two git config scripts.

As you can see there are also options to set default value or mark input as required.

## Dependencies on scripts

Scripts can depend on other scripts in which case the dependencies will be started automatically first.

```javascript
Imba.script('build', function(script) {
    script.cmd('yarn run compile');
});

Imba.script('deploy', function(script) {
    script.cmd('echo "deploying..."');
}).dependencies(['build']);
```

## Running scripts in series

By default each script run for each project in parallel. This can be changed to series mode if needed.

```javascript
Imba.project('a', './a');
Imba.project('b', './b');

Imba.script('a', function(script) {
    script.cmd('sleep 1');
    script.cmd('echo "Running 1st script for project \'${IMBA_PROJECT_NAME}\'"');
    script.cmd('sleep 1');
    script.cmd('echo "Running 2nd script for project \'${IMBA_PROJECT_NAME}\'"');
}).mode(Imba.ScriptMode.Series);
```

Now the output for the script `a` above should be something like this:

```
[a] sleep 1
[a] echo "Running 1st script for project 'a'"
[a] sleep 1
[a] echo "Running 2nd script for project 'a'"
[b] sleep 1
[b] echo "Running 1st script for project 'b'"
[b] sleep 1
[b] echo "Running 2nd script for project 'b'"
```

Whereas for parallel mode it should look like that:

```
[a] sleep 1
[b] sleep 1
[a] echo "Running 1st script for project 'a'"
[b] echo "Running 1st script for project 'b'"
[a] sleep 1
[b] sleep 1
[a] echo "Running 2nd script for project 'a'"
[b] echo "Running 2nd script for project 'b'"
```

Also in that example, the first way should take about 4 seconds to finish and the second about 2 seconds.

## With Typescript

Config file can be also written in `.ts` file. Just rename it and profit:

```typescript
import {project, script, ScriptMode} from '@imba/runner';

project('a', './a');

script('a', (script) => {
    script.cmd('...');
}).mode(ScriptMode.Series);
```

## CLI: running scripts

**Run script:**

```bash
$ imba run deploy
```

**Show available info about projects and scripts:**

```bash
$ imba info
```

**Set different config file:**

```bash
$ imba --config /path/to/monorepo/config.js <command>
```

or use `-c` alias:

```bash
$ imba -c /path/to/monorepo/config.js <command>
```

## CLI: execute custom command in project

It's not always optimal to run predefined project. Imagine that you want to maybe install new npm dependency into one of 
your projects. You surely don't want to create new script definition for that.

Instead you can execute command directly in project from your terminal:

```bash
$ imba exec project-name -- yarn add @angular/material
``` 

**Notice the double dash after `project-name`. It separates the imba command from your custom command.** 

## About Lerna

If your repository contains only JS code and nothing else, you should probably consider using 
[lerna](https://lernajs.io/). And I suggest using [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) too.
