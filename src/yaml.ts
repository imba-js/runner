import {YamlConfiguration} from './definitions';
import {FileReader} from './file-readers';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as _ from 'lodash';


export function readYamlConfiguration(reader: FileReader, file: string): YamlConfiguration
{
	const fileData = reader.readFile(file);
	const yamlData = yaml.safeLoad(fileData, {filename: file});

	return populateYamlConfiguration(reader, file, yamlData);
}


function populateYamlConfiguration(reader: FileReader, file: string, config: any): YamlConfiguration
{
	const dir = path.dirname(file);

	const yaml: YamlConfiguration = {
		projects: {},
		scripts: {},
	};

	if (_.isUndefined(config.projects)) {
		throw new Error(`Missing projects key in ${file} config file.`);
	}

	if (!_.isPlainObject(config.projects)) {
		throw new Error(`Projects key in ${file} must be a list of projects.`);
	}

	_.forEach(config.projects, (project, name) => {
		if (!_.isPlainObject(project)) {
			throw new Error(`Project ${name} in ${file} must contain a configuration object.`);
		}

		if (_.isUndefined(project.root)) {
			throw new Error(`Project ${name} in ${file} must contain root path.`);
		}

		if (!_.isString(project.root)) {
			throw new Error(`Root path for project ${name} in ${file} must be a string.`);
		}

		const root = path.join(dir, project.root);

		if (!reader.isDirectory(root)) {
			throw new Error(`Root path "${root}" for ${name} in ${file} must be an existing directory.`);
		}

		yaml.projects[name] = {
			root: root,
		};
	});

	if (_.isUndefined(config.scripts)) {
		config.scripts = {};
	}

	if (!_.isPlainObject(config.scripts)) {
		throw new Error(`Scripts in ${file} must be a list of scripts.`);
	}

	_.forEach(config.scripts, (script, name) => {
		if (!_.isPlainObject(script)) {
			throw new Error(`Script ${name} in ${file} must contain a configuration object.`);
		}

		yaml.scripts[name] = {
			mode: 'parallel',
			environment: {},
			except: [],
			only: [],
			dependencies: [],
			before_script: [],
			after_script: [],
			script: [],
			projects: {},
		};

		if (!_.isUndefined(script.mode)) {
			if (!_.isString(script.mode)) {
				throw new Error(`Mode for script ${name} in ${file} must be a "series" or "parallel" string.`);
			}

			if (script.mode !== 'series' && script.mode !== 'parallel') {
				throw new Error(`Mode for script ${name} in ${file} must be a "series" or "parallel" string, but "${script.mode}" given.`);
			}

			yaml.scripts[name].mode = script.mode;
		}

		if (!_.isUndefined(script.environment)) {
			if (!_.isPlainObject(script.environment)) {
				throw new Error(`Environment for script ${name} in ${file} must be a list of environment variables.`);
			}

			_.forEach(script.environment, (value, key) => {
				if (!_.isString(value)) {
					throw new Error(`Environment variable ${key} for script ${name} in ${file} must be a string.`);
				}

				if (/<parent\.env\.[a-zA-Z_]+>/.test(value)) {
					const envMatch = value.match(/<parent\.env\.([a-zA-Z_]+)>/);

					if (_.isUndefined(process.env[envMatch[1]])) {
						throw new Error(`Environment variable ${key} for script ${name} in ${file} requires parent environment ${envMatch[1]} which does not exists.`);
					}

					value = process.env[envMatch[1]];
				}

				yaml.scripts[name].environment[key] = value;
			});
		}

		if (!_.isUndefined(script.except)) {
			if (!_.isArray(script.except)) {
				throw new Error(`Except for script ${name} in ${file} must be a list of excluded project names.`);
			}

			_.forEach(script.except, (project) => {
				if (!_.isString(project)) {
					throw new Error(`Except for script ${name} in ${file} must contain only strings.`);
				}

				yaml.scripts[name].except.push(project);
			});
		}

		if (!_.isUndefined(script.only)) {
			if (!_.isArray(script.only)) {
				throw new Error(`Only for script ${name} in ${file} must be a list of included project names.`);
			}

			_.forEach(script.only, (project) => {
				if (!_.isString(project)) {
					throw new Error(`Only for script ${name} in ${file} must contain only strings.`);
				}

				yaml.scripts[name].only.push(project);
			});
		}

		if (!_.isUndefined(script.dependencies)) {
			if (!_.isArray(script.dependencies)) {
				throw new Error(`Dependencies for script ${name} in ${file} must be a list of other script names.`);
			}

			_.forEach(script.dependencies, (dependency) => {
				if (!_.isString(dependency)) {
					throw new Error(`Dependencies for script ${name} in ${file} must contain only strings.`);
				}

				yaml.scripts[name].dependencies.push(dependency);
			});
		}

		if (!_.isUndefined(script.before_script)) {
			yaml.scripts[name].before_script = processScriptsList(file, name, 'Before script', script.before_script);
		}

		if (!_.isUndefined(script.after_script)) {
			yaml.scripts[name].after_script = processScriptsList(file, name, 'After script', script.after_script);
		}

		if (!_.isUndefined(script.script)) {
			yaml.scripts[name].script = processScriptsList(file, name, 'Script', script.script);
		}

		if (!_.isUndefined(script.projects)) {
			if (!_.isPlainObject(script.projects)) {
				throw new Error(`Projects for script ${name} in ${file} must be a list of projects with their custom scripts.`);
			}

			_.forEach(script.projects, (project, projectName) => {
				if (!_.isPlainObject(project)) {
					throw new Error(`Project ${projectName} for script ${name} in ${file} must contain a configuration.`);
				}

				const existingProject = _.find(yaml.projects, (existingProject, existingProjectName) => {
					return existingProjectName === projectName;
				});

				if (!existingProject) {
					throw new Error(`Project ${projectName} defined for script ${name} in ${file} was not defined in projects configuration.`);
				}

				yaml.scripts[name].projects[projectName] = {
					before_script: _.isUndefined(project.before_script) ?
						_.clone(yaml.scripts[name].before_script) :
						processScriptsList(file, name, `Before script for project ${projectName}`, project.before_script),
					after_script: _.isUndefined(project.after_script) ?
						_.clone(yaml.scripts[name].after_script) :
						processScriptsList(file, name, `After script for project ${projectName}`, project.after_script),
					script: _.isUndefined(project.script) ?
						_.clone(yaml.scripts[name].script) :
						processScriptsList(file, name, `Script for project ${projectName}`, project.script),
				};
			});
		}
	});

	return yaml;
}


function processScriptsList(file: string, name: string, errorType: string, script: any): Array<string>
{
	if (_.isString(script)) {
		return [script];

	} else {
		if (!_.isArray(script)) {
			throw new Error(`${errorType} for script ${name} in ${file} must be a string or an array of strings.`);
		}

		const result: Array<string> = [];

		_.forEach(script, (item) => {
			if (!_.isString(item)) {
				throw new Error(`${errorType} for script ${name} in ${file} must be a string or an array of strings.`);
			}

			result.push(item);
		});

		return result;
	}
}
