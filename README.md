# imba-runner

`imba` command allows you to easily manage and run shell commands in your monolithic repository.

It's almost as if some parts of `docker-compose.yml`, `.gitlab-ci.yml` and `package.json` files had sex and this was 
their child.

## Example of PHP and JS app

**`.imba-runner.yml`:**

```yaml
projects:

  api:
    root: ./modules/api

  front:
    root: ./modules/front
    
scripts:

  deps:install:
    projects:
      api:
        script: composer install
      front:
        script: yarn install
        
  build:
    only: [front]
    script:  yarn run build

  up:
    script: docker-compose up
    
  down:
    script: docker-compose down
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

Next create new `.imba-runner.yml` file in the root of your monolithic repository.

## Projects

This is just a simple list with all of your projects and their paths.

```yaml
projects:

  a:
    root: ./a
    
  b:
    root: ./b
```

## Scripts

Now you must define all your scripts under `scripts` key. As you could see in the example above, script can either call 
the same or different commands for each project.

You can also say to run your script only for some projects or to exclude some others.

```yaml
scripts:

  a:
    script: echo "Run script a"
    
  b:
    projects:
      a:
        script: echo "Run script b in project a"
      b:
        script: echo "Run script b in project b"
        
  c:
    only: [a]
    script: echo "Run script c only in project a"
    
  d:
    except: [a]
    script: echo "Run script d in all projects, except for a"
```

## Run script before or after

Just like in `.gitlab-ci.yml` file, you can define special scripts to run before or after the main scripts.

```yaml
scripts:

  a:
    before_script: echo "Running before script for script a"
    after_script: echo "Running after script for script a"
    script: echo "Running script a"
```

**These `before_script` and `after_script` commands are called always when they're defined. Even if the main `script` 
fails.**

## Run list of more commands

Many times it's not enough to call just one command. Luckily you can just use arrays of commands instead.

```yaml
scripts:

  a:
    before_script:
      - echo "Running 1st before script for script a"
      - echo "Running 2nd before script for script a"
    after_script:
      - echo "Running 1st after script for script a"
      - echo "Running 2nd after script for script a"
    script:
      - echo "Running 1st script"
      - echo "Running 2nd script"
```

**If some command in list fail (returns non zero code), the following commands will not be called.**

**Also if the fail occurs in the `script` section, the whole `imba` command will also return the same code.**

## Environment variables

Imba-runner automatically adds some environment variables to your scripts.

```yaml
scripts:

  a:
    before_script:
      - echo ${IMBA_SCRIPT_NAME}        # output: a
      - echo ${IMBA_SCRIPT_TYPE_NAME}   # output: before_script
      - echo ${IMBA_PROJECT_NAME}       # output: currently running project
    script:
      - echo ${IMBA_SCRIPT_NAME}        # output: a
      - echo ${IMBA_SCRIPT_TYPE_NAME}   # output: script
      - echo ${IMBA_PROJECT_NAME}       # output: currently running project
    after_script:
      - echo ${IMBA_SCRIPT_RETURN_CODE} # output: return code from last command in script
      - echo ${IMBA_SCRIPT_NAME}        # output: a
      - echo ${IMBA_SCRIPT_TYPE_NAME}   # output: before_script
      - echo ${IMBA_PROJECT_NAME}       # output: currently running project
```

New custom environment variables could be added with `environment` key.

```yaml
scripts:
  
  deploy:
    environment:
      URL: example.com
      STAGE: beta
    script: echo "deploying ${STAGE} to ${URL}"
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

**Set different root directory:**

```bash
$ imba --dir /path/to/monorepo <command>
```

or use `-d` alias:

```bash
$ imba -d /path/to/monorepo <command>
```
