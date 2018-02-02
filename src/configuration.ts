import {ImbaConfiguration, ImbaProjectConfiguration, YamlConfiguration} from './definitions';
import {populateYamlConfiguration} from './yaml';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as _ from 'lodash';


export function readConfiguration(file: string): ImbaConfiguration
{
	const fileData = fs.readFileSync(file, {encoding: 'utf-8'});
	const yamlData = yaml.safeLoad(fileData, {filename: file});
	const yamlConfig = populateYamlConfiguration(file, yamlData);

	return parseYamlData(file, yamlConfig);
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


function parseYamlData(file: string, yaml: YamlConfiguration): ImbaConfiguration
{
	const config: ImbaConfiguration = {
		file: file,
		projects: {},
		scripts: {},
	};

	_.forEach(yaml.projects, (project, name) => {
		config.projects[name] = {
			root: project.root,
		};
	});

	_.forEach(yaml.scripts, (script, name) => {
		config.scripts[name] = {
			environment: {},
			dependencies: _.clone(script.dependencies),
			projects: {},
		};

		_.forEach(script.environment, (value, key) => {
			config.scripts[name].environment[key] = value;
		});

		_.forEach(config.projects, (project, projectName) => {
			if (script.except.indexOf(projectName) >= 0) {
				return;
			}

			if (script.only.length && script.only.indexOf(projectName) < 0) {
				return;
			}

			const projectScripts = _.find(script.projects, (scriptProject, scriptProjectName) => {
				return scriptProjectName === projectName;
			});

			config.scripts[name].projects[projectName] = {
				beforeScript: _.isUndefined(projectScripts) ? _.clone(script.before_script) : _.clone(projectScripts.before_script),
				afterScript: _.isUndefined(projectScripts) ? _.clone(script.after_script) : _.clone(projectScripts.after_script),
				script: _.isUndefined(projectScripts) ? _.clone(script.script) : _.clone(projectScripts.script),
			};
		});
	});

	return config;
}
