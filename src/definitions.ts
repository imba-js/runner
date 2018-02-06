export enum ImbaScriptMode
{
	Series,
	Parallel,
}


export declare interface ImbaProjectConfiguration
{
	name: string,
	root: string,
}


export declare interface ImbaProjectScriptConfiguration
{
	project: ImbaProjectConfiguration,
	parentScript: ImbaScriptConfiguration,
	beforeScript: Array<string>,
	afterScript: Array<string>,
	script: Array<string>,
}


export declare interface ImbaEnvironmentScriptConfiguration
{
	[name: string]: string,
}


export declare interface ImbaInputScriptConfiguration
{
	name: string,
	question: string,
	required: boolean,
}


export declare interface ImbaProjectScriptListConfiguration
{
	[name: string]: ImbaProjectScriptConfiguration,
}


export declare interface ImbaScriptConfiguration
{
	name: string,
	mode: ImbaScriptMode,
	environment: ImbaEnvironmentScriptConfiguration,
	inputs: Array<ImbaInputScriptConfiguration>,
	dependencies: Array<string>,
	projects: ImbaProjectScriptListConfiguration,
}


export declare interface ImbaConfiguration
{
	file: string,
	projects: {
		[name: string]: ImbaProjectConfiguration,
	},
	scripts: {
		[name: string]: ImbaScriptConfiguration,
	},
}


export declare interface YamlConfiguration
{
	projects: {
		[name: string]: {
			root: string,
		},
	},
	scripts: {
		[name: string]: {
			mode: string,
			environment: {[name: string]: string},
			inputs: Array<{name: string, question: string, required: boolean}>,
			except: Array<string>,
			only: Array<string>,
			dependencies: Array<string>,
			before_script: Array<string>,
			after_script: Array<string>,
			script: Array<string>,
			projects: {
				[name: string]: {
					before_script: Array<string>,
					after_script: Array<string>,
					script: Array<string>,
				},
			},
		},
	},
}
