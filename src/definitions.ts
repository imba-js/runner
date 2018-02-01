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
