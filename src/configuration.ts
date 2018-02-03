import {ImbaConfiguration, ImbaScriptConfiguration, YamlConfiguration, ImbaScriptMode} from './definitions';
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


function parseYamlData(file: string, yaml: YamlConfiguration): ImbaConfiguration
{
	const config: ImbaConfiguration = {
		file: file,
		projects: {},
		scripts: {},
	};

	_.forEach(yaml.projects, (project, name) => {
		config.projects[name] = {
			name: name,
			root: project.root,
		};
	});

	_.forEach(yaml.scripts, (script, name) => {
		config.scripts[name] = {
			name: name,
			mode: script.mode === 'series' ? ImbaScriptMode.Series : ImbaScriptMode.Parallel,
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
				project: project,
				parentScript: config.scripts[name],
				beforeScript: _.isUndefined(projectScripts) ? _.clone(script.before_script) : _.clone(projectScripts.before_script),
				afterScript: _.isUndefined(projectScripts) ? _.clone(script.after_script) : _.clone(projectScripts.after_script),
				script: _.isUndefined(projectScripts) ? _.clone(script.script) : _.clone(projectScripts.script),
			};
		});
	});

	_.forEach(config.scripts, (script) => {
		script.dependencies = constructDependencies(config, script);
	});

	return config;
}


function constructDependencies(config: ImbaConfiguration, script: ImbaScriptConfiguration): Array<string>
{
	let result: Array<string> = [];

	_.forEach(script.dependencies, (dependency: string) => {
		result.push(dependency);

		const innerScript = _.find(config.scripts, (script) => {
			return script.name === dependency;
		});

		result = constructDependencies(config, innerScript).concat(result);
	});

	return result;
}
