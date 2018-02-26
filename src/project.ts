export const SYSTEM_PROJECT_NAME: string = '__system__';


export class Project
{


	public readonly name: string;

	public readonly root: string;


	constructor(name: string, root: string)
	{
		this.name = name;
		this.root = root;
	}


	public static createSystemProject(): Project
	{
		return new Project(SYSTEM_PROJECT_NAME, SYSTEM_PROJECT_NAME);
	}

}
