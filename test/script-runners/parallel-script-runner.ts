import {ParallelScriptRunner} from '../../src/script-runners';
import {MockRunnerFactory} from '../../src/runners';
import {MockOutput} from '../../src/outputs';
import {Project} from '../../src/project';
import {Script} from '../../src/script';
import {expect} from 'chai';


let runnerFactory: MockRunnerFactory;
let scriptRunner: ParallelScriptRunner;


describe('#ScriptRunners/ParallelScriptRunner', () => {

	beforeEach(() => {
		runnerFactory = new MockRunnerFactory;
		scriptRunner = new ParallelScriptRunner(runnerFactory, new MockOutput);
	});

	describe('runScript()', () => {

		it('should run script on two projects in parallel', async () => {
			runnerFactory.commands['sleep'] = (runner) => {
				runner.timeout = 500;
			};

			const projectA = new Project('project:a', '');
			const projectB = new Project('project:b', '');

			const script = new Script('script:a', (storage) => {
				storage.cmd('sleep');
			});

			const startTime = Date.now();
			await scriptRunner.runScript([projectA, projectB], script);
			const elapsed = Date.now() - startTime;

			expect(elapsed).to.be.above(500).and.below(1000);
		});

	});

});
