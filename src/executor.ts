import {Output, Readline, Questions} from '@imba/stdio';
import {ChildProcessFactory} from '@imba/spawn';
import {ParallelScriptPrinter, ScriptPrinter, SeriesScriptPrinter, ProjectCommandPrinter} from './printers';
import {ParallelScriptRunner, ScriptRunner, SeriesScriptRunner} from './script-runners';
import {InputsList, Input, AnswersList} from './input';
import {Imba} from './imba';
import {Script, ScriptMode} from './script';
import {Project} from './project';
import {Command} from './commands';
import {createScriptEnvironment, EnvList} from './environment-variable';
import chalk from 'chalk';


export class Executor
{


	private childProcessFactory: ChildProcessFactory;

	private output: Output;

	private rl: Readline;

	private imba: Imba;

	private currentCommands: Array<Command> = [];


	constructor(childProcessFactory: ChildProcessFactory, output: Output, rl: Readline, imba: Imba)
	{
		this.childProcessFactory = childProcessFactory;
		this.output = output;
		this.rl = rl;
		this.imba = imba;
	}


	public async run(script: Script, dry: boolean = false): Promise<number>
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
		const answers = await this.getInputAnswers(inputs, dry);

		const beforeScriptsReturnCode = await this.runScriptsList(beforeScripts, answers, dry);

		if (beforeScriptsReturnCode > 0) {
			return finish(beforeScriptsReturnCode);
		}

		const returnCode = await this.runScript(script, answers[script.name], dry);
		const afterScriptsReturnCode = await this.runScriptsList(afterScripts, answers, dry);

		if (returnCode === 0 && afterScriptsReturnCode > 0) {
			return finish(afterScriptsReturnCode);
		}

		return finish(returnCode);
	}


	public killRunning(done?: () => void): void
	{
		this.output.log('');

		const total = this.currentCommands.length;
		const killing: Array<Command> = [];

		let isDone = false;
		let killed = 0;

		const kill = (command: Command) => {
			killed++;
			killing.splice(killing.indexOf(command), 1);

			if (killed === total && !isDone) {
				isDone = true;
				done();
			}
		};

		for (let i = 0; i < total; i++) {
			const command = this.currentCommands[i];
			killing.push(command);

			this.output.log(`Terminating ${command.name}...`);

			command.onEnd.subscribe(() => kill(command));
			command.kill();
		}

		setTimeout(() => {
			if (isDone) {
				return;
			}

			for (let i = 0; i < killing.length; i++) {
				if (!killing[i].isKilled()) {
					killing[i].kill('SIGKILL');
				}
			}

			done();
		}, 30 * 1000);
	}


	public runProjectCommand(project: Project, command: string): Promise<number>
	{
		const childProcess = this.childProcessFactory.create(project.root, command, createScriptEnvironment());
		const printer = new ProjectCommandPrinter(this.output);

		printer.enable(childProcess, project);

		return childProcess.run();
	}


	private async runScriptsList(scripts: Array<Script>, answers: AnswersList, dry: boolean): Promise<number>
	{
		let returnCode = 0;

		for (let i = 0; i < scripts.length; i++) {
			returnCode = await this.runScript(scripts[i], answers[scripts[i].name], dry);

			this.output.log('');

			if (returnCode > 0) {
				return returnCode;
			}
		}

		return returnCode;
	}


	private runScript(script: Script, inputAnswers: EnvList, dry: boolean): Promise<number>
	{
		let runner: ScriptRunner;
		let scriptPrinter: ScriptPrinter;

		if (script.getMode() === ScriptMode.Series) {
			runner = new SeriesScriptRunner(this.childProcessFactory);
			scriptPrinter = new SeriesScriptPrinter(this.output);
		} else {
			runner = new ParallelScriptRunner(this.childProcessFactory);
			scriptPrinter = new ParallelScriptPrinter(this.output);
		}

		runner.onCommandRun.subscribe((arg) => {
			this.currentCommands.push(arg.command);
		});

		runner.onCommandFinish.subscribe((arg) => {
			const pos = this.currentCommands.indexOf(arg.command);

			if (pos >= 0) {
				this.currentCommands.splice(pos, 1);
			}
		});

		scriptPrinter.enablePrinter(runner);

		const projects = script.getAllowedProjects();

		return runner.runScript(projects, script, inputAnswers, dry);
	}


	private async getInputAnswers(inputs: InputsList, dry: boolean): Promise<AnswersList>
	{
		const questions = new Questions(this.output, this.rl);
		const result: AnswersList = {};

		for (let name in inputs) {
			if (inputs.hasOwnProperty(name)) {
				result[name] = {};

				for (let i = 0; i < inputs[name].length; i++) {
					const input: Input = inputs[name][i];

					if (dry) {
						result[name][input.name] = '';

					} else {
						result[name][input.name] = await questions.askQuestion(input.question, {
							required: input.required,
							defaultValue: input.defaultValue,
						});
					}
				}
			}
		}

		return result;
	}

}
