export declare interface ImbaProjectConfiguration
{
	root: string,
}


export declare interface ImbaProjectScriptConfiguration
{
	beforeScript: Array<string>,
	afterScript: Array<string>,
	script: Array<string>,
}


export declare interface ImbaEnvironmentScriptConfiguration
{
	[name: string]: string,
}


export declare interface ImbaScriptConfiguration
{
	environment: ImbaEnvironmentScriptConfiguration,
	projects: {
		[name: string]: ImbaProjectScriptConfiguration,
	},
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
			environment: {[name: string]: string},
			except: Array<string>,
			only: Array<string>,
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
