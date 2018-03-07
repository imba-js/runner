import {MockChildProcessFactory} from '@imba/spawn';
import {ParallelScriptRunner} from '../../../src/script-runners/index';
import {Imba} from '../../../src/imba';
import {Project} from '../../../src/project';
import {Script} from '../../../src/script';
import {expect} from 'chai';


let imba: Imba;
let childProcessFactory: MockChildProcessFactory;
let scriptRunner: ParallelScriptRunner;


describe('#ScriptRunners/ParallelScriptRunner', () => {

	beforeEach(() => {
		imba = new Imba;
		childProcessFactory = new MockChildProcessFactory;
		scriptRunner = new ParallelScriptRunner(childProcessFactory);
	});

	describe('runScript()', () => {

		it('should run script on two projects in parallel', async () => {
			childProcessFactory.commands['sleep'] = (runner) => {
				runner.timeout = 500;
			};

			const projectA = new Project('project:a', '');
			const projectB = new Project('project:b', '');

			const script = new Script(imba, 'script:a', (storage) => {
				storage.cmd('sleep');
			});

			const startTime = Date.now();
			await scriptRunner.runScript([projectA, projectB], script);
			const elapsed = Date.now() - startTime;

			expect(elapsed).to.be.above(500).and.below(1000);
		});

	});

});
