import {MockRunnerFactory, MockRunner} from '../../../src/runners/index';
import {expect} from 'chai';


let factory: MockRunnerFactory;


describe('#Runners/MockRunnerFactory', () => {

	beforeEach(() => {
		factory = new MockRunnerFactory;
	});

	describe('createRunner()', () => {

		it('should create new mock runner', () => {
			expect(factory.createRunner('', '', {})).to.be.an.instanceOf(MockRunner);
		});

		it('should create new mock runner for specific command', () => {
			let called = 0;

			factory.commands['pwd'] = (runner) => {
				expect(runner).to.be.an.instanceOf(MockRunner);
				called++;
			};

			factory.createRunner('', '', {});
			factory.createRunner('', 'pwd', {});
			factory.createRunner('', '', {});

			expect(called).to.be.equal(1);
		});

	});

});
