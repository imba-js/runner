import {Script, ScriptMode} from '../src/script';
import {Input} from '../src/input';
import {EnvironmentVariable} from '../src/environment-variable';
import {Imba} from '../src/imba';
import {Project} from '../src/project';
import {CommandsStorage} from '../src/commands-storage';
import {CmdCommand} from '../src/commands';
import {MockRunnerFactory} from '../src/runners';
import {RunContext} from '../src/run-context';
import {expect} from 'chai';


let imba: Imba;
let script: Script;
let runnerFactory: MockRunnerFactory;
let ctx: RunContext;


describe('#Script', () => {

	beforeEach(() => {
		imba = new Imba;
		runnerFactory = new MockRunnerFactory;
		script = new Script(imba, 'a', () => {});
		ctx = new RunContext(new Project('a', './a'));
	});

	it('should create new script', () => {
		expect(script.name).to.be.equal('a');
	});

	describe('mode()', () => {

		it('should set script mode', () => {
			script.mode(ScriptMode.Series);
			expect(script.getMode()).to.be.equal(ScriptMode.Series);

			script.mode(ScriptMode.Parallel);
			expect(script.getMode()).to.be.equal(ScriptMode.Parallel);
		});

	});

	describe('before()', () => {

		it('should set before definition', () => {
			expect(script.hasBeforeScripts()).to.be.equal(false);
			script.before(() => {});
			expect(script.hasBeforeScripts()).to.be.equal(true);
		});

		it('should get all before scripts recursively', () => {
			const scriptA = imba.script('a', () => {});
			const scriptB = imba.script('b', () => {}).before('a');
			const scriptC = imba.script('c', () => {}).before('b');
			const scriptD = imba.script('d', () => {}).before('c');

			expect(scriptA.getBeforeScripts(true)).to.be.eql([]);
			expect(scriptB.getBeforeScripts(true)).to.be.eql([scriptA]);
			expect(scriptC.getBeforeScripts(true)).to.be.eql([scriptA, scriptB]);
			expect(scriptD.getBeforeScripts(true)).to.be.eql([scriptA, scriptB, scriptC]);
		});

	});

	describe('after()', () => {

		it('should set after definition', () => {
			expect(script.hasAfterScripts()).to.be.equal(false);
			script.after(() => {});
			expect(script.hasAfterScripts()).to.be.equal(true);
		});

		it('should get all after scripts recursively', () => {
			const scriptA = imba.script('a', () => {});
			const scriptB = imba.script('b', () => {}).after('a');
			const scriptC = imba.script('c', () => {}).after('b');
			const scriptD = imba.script('d', () => {}).after('c');

			expect(scriptA.getAfterScripts(true)).to.be.eql([]);
			expect(scriptB.getAfterScripts(true)).to.be.eql([scriptA]);
			expect(scriptC.getAfterScripts(true)).to.be.eql([scriptB, scriptA]);
			expect(scriptD.getAfterScripts(true)).to.be.eql([scriptC, scriptB, scriptA]);
		});

	});

	describe('inputs()', () => {

		it('should set inputs', () => {
			expect(script.hasInputs()).to.be.equal(false);

			script.input('a', 'what is a?');

			expect(script.hasInputs()).to.be.equal(true);
			expect(script.getInputs()).to.have.lengthOf(1);
			expect(script.getInputs()[0]).to.be.an.instanceOf(Input);
			expect(script.getInputs()[0].name).to.be.equal('a');
			expect(script.getInputs()[0].question).to.be.equal('what is a?');
		});

	});

	describe('envs()', () => {

		it('should set envs', () => {
			expect(script.hasEnvs()).to.be.equal(false);

			script.env('A', 'a');

			expect(script.hasEnvs()).to.be.equal(true);
			expect(script.getEnvs()).to.have.lengthOf(1);
			expect(script.getEnvs()[0]).to.be.an.instanceOf(EnvironmentVariable);
			expect(script.getEnvs()[0].name).to.be.equal('A');
			expect(script.getEnvs()[0].value).to.be.equal('a');
		});

	});

	describe('getAllowedProjects()', () => {

		it('should return all allowed projects', () => {
			imba.project('a', './a');
			imba.project('b', './b');
			imba.project('c', './c');

			const projectA = imba.getProject('a');
			const projectB = imba.getProject('b');
			const projectC = imba.getProject('c');

			imba.script('a', () => {});
			imba.script('b', () => {}).only(['a']);
			imba.script('c', () => {}).except(['b']);

			const scriptA = imba.getScript('a');
			const scriptB = imba.getScript('b');
			const scriptC = imba.getScript('c');

			expect(scriptA.getAllowedProjects()).to.be.eql([projectA, projectB, projectC]);
			expect(scriptB.getAllowedProjects()).to.be.eql([projectA]);
			expect(scriptC.getAllowedProjects()).to.be.eql([projectA, projectC]);
		});

	});

	describe('createCommands()', () => {

		it('should create empty commands storage', () => {
			const commands = script.createCommands(runnerFactory, ctx);

			expect(commands).to.be.an.instanceOf(CommandsStorage);
			expect(commands.isEmpty()).to.be.equal(true);
		});

		it('should create commands storage from definition', () => {
			script = new Script(imba, 'a', (storage) => {
				storage.cmd('pwd');
			});

			const commands = script.createCommands(runnerFactory, ctx);

			expect(commands).to.be.an.instanceOf(CommandsStorage);
			expect(commands.isEmpty()).to.be.equal(false);
			expect(commands.getCommands()).to.have.lengthOf(1);
			expect(commands.getCommands()[0]).to.be.an.instanceOf(CmdCommand);
			expect(commands.getCommands()[0].name).to.be.equal('pwd');
		});

	});

});
