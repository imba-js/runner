import {MockOutput} from '../../../src/outputs/index';
import {expect} from 'chai';


let output: MockOutput;


describe('#Outputs/MockOutput', () => {

	beforeEach(() => {
		output = new MockOutput;
	});

	describe('log()', () => {

		it('should log messages', () => {
			output.log('hello');
			output.log('world');

			expect(output._log).to.be.eql([
				'hello',
				'world',
			]);
		});

	});

	describe('stdout()', () => {

		it('should log stdout', () => {
			output.stdout('hello');
			output.stdout('world');

			expect(output._stdout).to.be.eql([
				'hello',
				'world',
			]);
		});

	});

	describe('stderr()', () => {

		it('should log stderr', () => {
			output.stderr('hello');
			output.stderr('world');

			expect(output._stderr).to.be.eql([
				'hello',
				'world',
			]);
		});

	});

});
