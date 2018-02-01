import {ImbaConfiguration, ImbaProjectConfiguration} from './definitions';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as _ from 'lodash';


export function readConfiguration(file: string): ImbaConfiguration
{
	const fileData = fs.readFileSync(file, {encoding: 'utf-8'});
	const yamlData = yaml.safeLoad(fileData, {filename: file});

	return parseYamlData(file, yamlData);
}


export function getProjectConfiguration(configuration: ImbaConfiguration, name: string): ImbaProjectConfiguration
{
	const project = _.find(configuration.projects, (project, projectName) => {
		return projectName === name;
	});

	if (!project) {
		throw new Error(`Project ${name} does not exists.`);
	}

	return project;
}


function parseYamlData(file: string, data: any): ImbaConfiguration
{
	const dir = path.dirname(file);

	const config: ImbaConfiguration = {
		file: file,
		projects: {},
		scripts: {},
	};

	_.forEach(data.projects, (project: any, name: string) => {
		if (!_.isString(project.root)) {
			throw new Error(`Project root for "${name}" must be a string.`);
		}

		const root = path.join(dir, project.root);

		if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
			throw new Error(`Project root "${root}" for "${name}" must be a directory.`);
		}

		config.projects[name] = {
			root: root,
		};
	});

	_.forEach(data.scripts, (script: any, name: string) => {
		config.scripts[name] = {
			environment: parseEnvironment(name, script.environment),
			projects: {},
		};

		prepareYamlConfigurationScript(name, script);

		const commonBeforeScript = parseScripts(name, 'before_script', script.before_script);
		const commonAfterScript = parseScripts(name, 'after_script', script.after_script);
		const commonScript = parseScripts(name, 'script', script.script);

		_.forEach(config.projects, (project, projectName) => {
			if (_.isUndefined(script.projects[projectName])) {
				script.projects[projectName] = {};
			}

			if (script.except.indexOf(projectName) >= 0) {
				return;
			}

			if (script.only.length && script.only.indexOf(projectName) < 0) {
				return;
			}

			config.scripts[name].projects[projectName] = {
				beforeScript: parseScripts(name, `${projectName}.before_script`, script.projects[projectName].before_script, commonBeforeScript),
				afterScript: parseScripts(name, `${projectName}.after_script`, script.projects[projectName].after_script, commonAfterScript),
				script: parseScripts(name, `${projectName}.script`, script.projects[projectName].script, commonScript),
			};

			if (!config.scripts[name].projects[projectName].script.length) {
				throw new Error(`Missing script in "${name}" for project "${projectName}".`);
			}
		});
	});

	return config;
}


function prepareYamlConfigurationScript(name: string, script: any): void
{
	if (_.isUndefined(script.environment)) {
		script.environment = {};
	}

	if (_.isUndefined(script.projects)) {
		script.projects = {};
	}

	if (_.isUndefined(script.only)) {
		script.only = [];
	}

	if (_.isUndefined(script.except)) {
		script.except = [];
	}

	if (!_.isObject(script.projects)) {
		throw new Error(`Script projects ${name} must be an object.`);
	}

	if (!_.isArray(script.only)) {
		throw new Error(`Script only option must be an array of strings.`);
	}

	if (!_.isArray(script.except)) {
		throw new Error(`Script except option must be an array of strings.`);
	}

	_.forEach(script.only, (only) => {
		if (!_.isString(only)) {
			throw new Error(`Script only option must be an array of strings.`);
		}
	});

	_.forEach(script.except, (except) => {
		if (!_.isString(except)) {
			throw new Error(`Script except option must be an array of strings.`);
		}
	});
}



function parseEnvironment(name: string, environment: any): {[name: string]: string}
{
	function err(): void
	{
		throw new Error(`Script ${name}.environment must contain only a list strings.`);
	}

	const result = {};

	if (_.isUndefined(environment)) {
		// skip

	} else if (_.isObject(environment)) {
		_.forEach(environment, (value, key) => {
			if (!_.isString(value)) {
				err();
			}

			result[key] = value;
		});

	} else {
		err();
	}

	return result;
}


function parseScripts(name: string, type: string, scripts: any, fallback?: Array<string>): Array<string>
{
	function err(): void
	{
		throw new Error(`Script ${name}.${type} must contain only single string command or an array of string commands.`);
	}

	const result: Array<string> = [];

	if (_.isUndefined(scripts)) {
		if (!_.isUndefined(fallback)) {
			return fallback;
		}

	} else if (_.isString(scripts)) {
		result.push(scripts);

	} else if (_.isArray(scripts)) {
		_.forEach(scripts, (script) => {
			if (!_.isString(script)) {
				err();
			}

			result.push(script);
		});

	} else {
		err();
	}

	return result;
}
