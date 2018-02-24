import {CallbackCommand} from '../../../src/commands';
import {RunContext} from '../../../src/run-context';
import {Project} from '../../../src/project';
import {expect} from 'chai';


let ctx: RunContext;


describe('#CallbackCommand', () => {

	beforeEach(() => {
		ctx = new RunContext(new Project('a', './a'));
	});

	it('should transform failing callback command', async () => {
		const cmd = new CallbackCommand('test', () => {
			throw new Error('Catch me');
		});

		const stderr: Array<string> = [];

		cmd.onStderr.subscribe((chunk) => stderr.push(chunk));

		const returnCode = await cmd.run(ctx);

		expect(returnCode).to.be.equal(1);
		expect(stderr.join('')).to.be.equal('Error: Catch me');
	});

});
