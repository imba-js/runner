import {SpawnRunnerFactory, SpawnRunner} from '../../src/runners';
import {expect} from 'chai';


let factory: SpawnRunnerFactory;


describe('#Runners/SpawnRunnerFactory', () => {

	beforeEach(() => {
		factory = new SpawnRunnerFactory;
	});

	describe('createRunner()', () => {

		it('should create new spawn runner', () => {
			expect(factory.createRunner('', '', {})).to.be.an.instanceOf(SpawnRunner);
		});

	});

});
