import {ParallelScriptPrinter, ScriptPrinter, SeriesScriptPrinter, ProjectCommandPrinter} from './printers';
import {ParallelScriptRunner, ScriptRunner, SeriesScriptRunner} from './script-runners';
import {RunnerFactory} from './runners';
import {Output} from './outputs';
import {Imba} from './imba';
import {Script, ScriptMode, RecursiveInputsList} from './script';
import {Project} from './project';
import {Questions} from './questions';
import {createScriptEnvironment, EnvList} from './environment-variable';
import chalk from 'chalk';


declare interface ScriptWithInputAnswers
{
	main: EnvList,
	dependencies: {
		[scriptName: string]: EnvList,
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

		const beforeScripts = script.getBeforeScripts(true);
		const afterScripts = script.getAfterScripts(true);

		const inputs = script.getAllRecursiveInputs();
		const answers = await this.getInputAnswers(inputs);

		const beforeScriptsReturnCode = await this.runScriptsList(beforeScripts, answers);

		if (beforeScriptsReturnCode > 0) {
			return finish(beforeScriptsReturnCode);
		}

		const returnCode = await this.runScript(script, answers.main);
		const afterScriptsReturnCode = await this.runScriptsList(afterScripts, answers);

		if (returnCode === 0 && afterScriptsReturnCode > 0) {
			return finish(afterScriptsReturnCode);
		}

		return finish(returnCode);
	}


	public runProjectCommand(project: Project, command: string): Promise<number>
	{
		const runner = this.runnerFactory.createRunner(project.root, command, createScriptEnvironment());
		const printer = new ProjectCommandPrinter(this.output);

		printer.enable(runner, project);

		return runner.run();
	}


	private async runScriptsList(scripts: Array<Script>, answers: ScriptWithInputAnswers): Promise<number>
	{
		let returnCode = 0;

		for (let i = 0; i < scripts.length; i++) {
			returnCode = await this.runScript(scripts[i], answers.dependencies[scripts[i].name]);

			this.output.log('');

			if (returnCode > 0) {
				return returnCode;
			}
		}

		return returnCode;
	}


	private runScript(script: Script, inputAnswers: EnvList = {}): Promise<number>
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

		const projects = script.getAllowedProjects();

		return runner.runScript(projects, script, inputAnswers);
	}


	private async getInputAnswers(inputs: RecursiveInputsList): Promise<ScriptWithInputAnswers>
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
