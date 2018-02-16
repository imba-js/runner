import {SpawnRunner} from '../../src/runners';
import {expect} from 'chai';


describe('#Runners/SpawnRunner', () => {

	describe('run()', () => {

		it.skip('should run command', async () => {
			const command = 'node -e "process.stdout.write(\'hello world\\n\'); process.stderr.write(\'hello hell\\n\');"';
			const runner = new SpawnRunner(__dirname, command, {});

			runner.onStart.subscribe((currentCommand) => {
				expect(currentCommand).to.be.equal(command);
			});

			runner.onFinish.subscribe((returnCode) => {
				expect(returnCode).to.be.equal(0);
			});

			const stdout = [];
			const stderr = [];

			runner.onStdout.subscribe((chunk) => {
				stdout.push(chunk);
			});

			runner.onStderr.subscribe((chunk) => {
				stderr.push(chunk);
			});

			const returnCode = await runner.run();

			expect(returnCode).to.be.equal(0);
			expect(stdout.join('')).to.be.equal('hello world\n');
			expect(stderr.join('')).to.be.equal('hello hell\n');
		});

	});

});
