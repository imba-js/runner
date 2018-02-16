import {ParallelScriptPrinter, ScriptPrinter, SeriesScriptPrinter, ProjectCommandPrinter} from './printers';
import {ParallelScriptRunner, ScriptRunner, SeriesScriptRunner} from './script-runners';
import {RunnerFactory} from './runners';
import {Output} from './outputs';
import {Imba} from './imba';
import {Script, ScriptMode} from './script';
import {Project} from './project';
import {Questions} from './questions';
import {CommandEnvList} from './command';
import {createScriptEnvironment} from './environment-variable';
import {Input} from './input';
import chalk from 'chalk';


declare interface ScriptWithDependenciesInputs
{
	main: Array<Input>,
	dependencies: {
		[scriptName: string]: Array<Input>,
	},
}


declare interface ScriptWithInputAnswers
{
	main: CommandEnvList,
	dependencies: {
		[scriptName: string]: CommandEnvList,
	},
}


export class Executor
{


	private imba: Imba;

	private output: Output;

	private runnerFactory: RunnerFactory;


	constructor(runnerFactory: RunnerFactory, output: Output, imba: Imba)
	{
		this.runnerFactory = runnerFactory;
		this.output = output;
		this.imba = imba;
	}


	public async run(script: Script): Promise<number>
	{
		const startTime = new Date;

		const finish = (returnCode: number) => {
			const endTime = new Date;
			const seconds = endTime.getSeconds() - startTime.getSeconds();

			const message = `Script ${script.name} finished with return code ${returnCode} in ${seconds} second${seconds === 1 ? '' : 's'}.`;

			this.output.log('');
			this.output.log(!returnCode ? chalk.bold.bgGreen.black(message) : chalk.bold.bgRed(message));

			return returnCode;
		};

		const dependencies = script.getRecursiveScriptDependencies(this.imba);
		const inputs = this.getAllInputs(script, dependencies);
		const answers = await this.getInputAnswers(inputs);

		const dependenciesReturnCode = await this.runDependencies(dependencies, answers);

		if (dependenciesReturnCode > 0) {
			return finish(dependenciesReturnCode);
		}

		const returnCode = await this.runScript(script, answers.main);
		return finish(returnCode);
	}


	public runProjectCommand(project: Project, command: string): Promise<number>
	{
		const runner = this.runnerFactory.createRunner(project.root, command, createScriptEnvironment());
		const printer = new ProjectCommandPrinter(this.output);

		printer.enable(runner, project);

		return runner.run();
	}


	private async runDependencies(dependencies: Array<Script>, answers: ScriptWithInputAnswers): Promise<number>
	{
		let returnCode = 0;

		for (let i = 0; i < dependencies.length; i++) {
			returnCode = await this.runScript(dependencies[i], answers.dependencies[dependencies[i].name]);

			this.output.log('');

			if (returnCode > 0) {
				return returnCode;
			}
		}

		return returnCode;
	}


	private runScript(script: Script, inputAnswers: CommandEnvList = {}): Promise<number>
	{
		let runner: ScriptRunner;
		let scriptPrinter: ScriptPrinter;

		if (script.getMode() === ScriptMode.Series) {
			runner = new SeriesScriptRunner(this.runnerFactory, this.output);
			scriptPrinter = new SeriesScriptPrinter(this.output);
		} else {
			runner = new ParallelScriptRunner(this.runnerFactory, this.output);
			scriptPrinter = new ParallelScriptPrinter(this.output);
		}

		scriptPrinter.enablePrinter(runner);

		const projects = script.getAllowedProjects(this.imba.getProjects());

		return runner.runScript(projects, script, inputAnswers);
	}


	private getAllInputs(script: Script, dependencies: Array<Script>): ScriptWithDependenciesInputs
	{
		const result: ScriptWithDependenciesInputs = {
			main: [],
			dependencies: {},
		};

		let inputs = script.getInputs();
		for (let i = 0; i < inputs.length; i++) {
			result.main.push(inputs[i]);
		}

		for (let i = 0; i < dependencies.length; i++) {
			let dependency = dependencies[i];
			let inputs = dependencies[i].getInputs();

			result.dependencies[dependency.name] = [];

			for (let j = 0; j < inputs.length; j++) {
				result.dependencies[dependency.name].push(inputs[j]);
			}
		}

		return result;
	}


	private async getInputAnswers(inputs: ScriptWithDependenciesInputs): Promise<ScriptWithInputAnswers>
	{
		const questions = new Questions(this.output);
		const result: ScriptWithInputAnswers = {
			main: {},
			dependencies: {},
		};

		result.main = await questions.askQuestions(inputs.main);

		for (let name in inputs.dependencies) {
			if (inputs.dependencies.hasOwnProperty(name)) {
				result.dependencies[name] = await questions.askQuestions(inputs.dependencies[name]);
			}
		}

		return result;
	}

}
