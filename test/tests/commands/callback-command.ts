import {CallbackCommand} from '../../../src/commands';
import {RunContext, RunState} from '../../../src/run-context';
import {Project} from '../../../src/project';
import {Imba} from '../../../src/imba';
import {expect} from 'chai';


let imba: Imba;
let ctx: RunContext;


describe('#CallbackCommand', () => {

	beforeEach(() => {
		imba = new Imba;
		ctx = new RunContext(RunState.Run, new Project('a', './a'));
	});

	it('should transform failing callback command', async () => {
		const cmd = new CallbackCommand(imba, 'test', () => {
			throw new Error('Catch me');
		});

		const stderr: Array<string> = [];

		cmd.onStderr.subscribe((chunk) => stderr.push(chunk));

		const returnCode = await cmd.run(ctx);

		expect(returnCode).to.be.equal(1);
		expect(stderr.join('')).to.be.equal('Error: Catch me');
	});

});
