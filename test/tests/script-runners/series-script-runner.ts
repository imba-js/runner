import {MockChildProcessFactory} from '@imba/spawn';
import {SeriesScriptRunner} from '../../../src/script-runners';
import {Imba} from '../../../src/imba';
import {Project} from '../../../src/project';
import {Script} from '../../../src/script';
import {expect} from 'chai';


let imba: Imba;
let childProcessFactory: MockChildProcessFactory;
let scriptRunner: SeriesScriptRunner;


describe('#ScriptRunners/SeriesScriptRunner', () => {

	beforeEach(() => {
		imba = new Imba;
		childProcessFactory = new MockChildProcessFactory;
		scriptRunner = new SeriesScriptRunner(childProcessFactory);
	});

	describe('runScript()', () => {

		it('should run script on two projects in series', async () => {
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

			expect(elapsed).to.be.above(1000);
		});

	});

});
