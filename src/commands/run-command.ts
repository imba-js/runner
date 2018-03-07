import {ChildProcessFactory} from '@imba/spawn';
import {Command} from './command';
import {RunContext} from '../run-context';
import {Script} from '../script';
import {Imba} from '../imba';
import {Input} from '../input';
import {SeriesScriptRunner} from '../script-runners';
import * as _ from 'lodash';
import chalk from 'chalk';


export class RunCommand extends Command
{


	private _childProcessFactory: ChildProcessFactory;

	private _scriptName: string;

	private _script: Script;


	constructor(imba: Imba, childProcessFactory: ChildProcessFactory, script: string)
	{
		super(imba, `Script: ${script}`);

		this._childProcessFactory = childProcessFactory;
		this._scriptName = script;
	}


	public async run(ctx: RunContext): Promise<number>
	{
		const script = this.getScript();
		const scriptRunner = new SeriesScriptRunner(this._childProcessFactory);

		if (!script.isAllowedForProject(ctx.project)) {
			this.onStderr.emit(`Can not run script ${script.name} inside of script ${this._scriptName} for project ${ctx.project.name}.`);
			return 1;
		}

		scriptRunner.onCommandRun.subscribe((arg) => {
			this.onStdout.emit(`${chalk.magenta('[inner]')} - ${arg.command.name}\n`);
		});

		scriptRunner.onCommandStdout.subscribe((arg) => {
			this.onStdout.emit(`${chalk.magenta('[inner]')} ${arg.chunk}`);
		});

		scriptRunner.onCommandStderr.subscribe((arg) => {
			this.onStderr.emit(`${chalk.magenta('[inner]')} ${arg.chunk}`);
		});

		return await scriptRunner.runProjectScript(ctx.project, script, ctx.inputs);
	}


	public getInputs(): Array<Input>
	{
		return this.getScript().getInputs();
	}


	private getScript(): Script
	{
		if (_.isUndefined(this._script)) {
			this._script = this._imba.getScript(this._scriptName, true);
		}

		return this._script;
	}

}
