import {ImbaConfiguration, ImbaProjectConfiguration, ImbaScriptConfiguration, ImbaScriptMode} from './definitions';
import {ParallelScriptPrinter, ScriptPrinter, SeriesScriptPrinter} from './printers';
import {ParallelScriptRunner, ScriptRunner, SeriesScriptRunner} from './script-runners';
import {RunnerFactory} from './runners';
import {Output} from './outputs';
import chalk from 'chalk';


export class MainRunner
{


	private config: ImbaConfiguration;

	private output: Output;

	private runnerFactory: RunnerFactory;


	constructor(runnerFactory: RunnerFactory, output: Output, config: ImbaConfiguration)
	{
		this.runnerFactory = runnerFactory;
		this.output = output;
		this.config = config;
	}


	public async run(script: ImbaScriptConfiguration): Promise<number>
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

		const dependenciesReturnCode = await this.runDependencies(script.dependencies);

		if (dependenciesReturnCode > 0) {
			return finish(dependenciesReturnCode);
		}

		const returnCode = await this.runScript(script);
		return finish(returnCode);
	}


	public runProjectCommand(project: ImbaProjectConfiguration, command: string): Promise<number>
	{
		const runner = new SeriesScriptRunner(this.runnerFactory, this.output, this.config);
		const scriptPrinter = new SeriesScriptPrinter(this.output);

		scriptPrinter.enablePrinter(runner);

		return runner.runCommand(project, command, runner.modifyEnvironment());
	}


	private async runDependencies(dependencies: Array<string>): Promise<number>
	{
		let returnCode = 0;

		for (let i = 0; i < dependencies.length; i++) {
			returnCode = await this.runScript(this.config.scripts[dependencies[i]]);

			this.output.log('');

			if (returnCode > 0) {
				return returnCode;
			}
		}

		return returnCode;
	}


	private runScript(script: ImbaScriptConfiguration): Promise<number>
	{
		let runner: ScriptRunner;
		let scriptPrinter: ScriptPrinter;

		if (script.mode === ImbaScriptMode.Series) {
			runner = new SeriesScriptRunner(this.runnerFactory, this.output, this.config);
			scriptPrinter = new SeriesScriptPrinter(this.output);
		} else {
			runner = new ParallelScriptRunner(this.runnerFactory, this.output, this.config);
			scriptPrinter = new ParallelScriptPrinter(this.output);
		}

		scriptPrinter.enablePrinter(runner);

		return runner.runScript(script.name);
	}

}
