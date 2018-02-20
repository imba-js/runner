import {Script, ScriptMode} from '../src/script';
import {Input} from '../src/input';
import {EnvironmentVariable} from '../src/environment-variable';
import {Imba} from '../src/imba';
import {Project} from '../src/project';
import {CommandsStorage} from '../src/commands-storage';
import {CmdCommand} from '../src/commands';
import {MockRunnerFactory} from '../src/runners';
import {expect} from 'chai';


let imba: Imba;
let script: Script;
let runnerFactory: MockRunnerFactory;


describe('#Script', () => {

	beforeEach(() => {
		runnerFactory = new MockRunnerFactory;
		script = new Script('a', () => {});
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
			expect(script.hasBeforeDefinition()).to.be.equal(false);
			script.before(() => {});
			expect(script.hasBeforeDefinition()).to.be.equal(true);
		});

	});

	describe('after()', () => {

		it('should set after definition', () => {
			expect(script.hasAfterDefinition()).to.be.equal(false);
			script.after(() => {});
			expect(script.hasAfterDefinition()).to.be.equal(true);
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

	describe('dependencies()', () => {

		it('should set dependencies', () => {
			expect(script.hasDependencies()).to.be.equal(false);

			script.dependencies(['a']);

			expect(script.hasDependencies()).to.be.equal(true);
			expect(script.getDependencies()).to.be.eql(['a']);
		});

	});

	describe('getRecursiveScriptDependencies()', () => {

		beforeEach(() => {
			imba = new Imba;
		});

		it('should throw an error if dependent script does not exists', () => {
			imba.script('a', () => {}).dependencies(['b']);

			expect(() => {
				imba.getScript('a').getRecursiveScriptDependencies(imba);
			}).to.throw(Error, 'Script a depends on script b which is not defined.');
		});

		it('should throw an error if circular dependency was detected', () => {
			imba.script('a', () => {}).dependencies(['b']);
			imba.script('b', () => {}).dependencies(['c']);
			imba.script('c', () => {}).dependencies(['a']);

			expect(() => {
				imba.getScript('a').getRecursiveScriptDependencies(imba);
			}).to.throw(Error, 'Script a contains circular dependency: a, b, c.');
		});

		it('should get all dependent scripts recursively', () => {
			imba.script('a', () => {}).dependencies(['b']);
			imba.script('b', () => {}).dependencies(['c']);
			imba.script('c', () => {});

			expect(imba.getScript('a').getRecursiveScriptDependencies(imba)).to.be.eql([
				imba.getScript('b'),
				imba.getScript('c'),
			]);
		});

	});

	describe('getAllowedProjects()', () => {

		beforeEach(() => {
			imba = new Imba;
		});

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

			expect(scriptA.getAllowedProjects(imba)).to.be.eql([projectA, projectB, projectC]);
			expect(scriptB.getAllowedProjects(imba)).to.be.eql([projectA]);
			expect(scriptC.getAllowedProjects(imba)).to.be.eql([projectA, projectC]);
		});

	});

	describe('createBeforeCommands()', () => {

		it('should create empty commands storage', () => {
			const commands = script.createBeforeCommands(runnerFactory, {
				project: new Project('a', './a'),
				env: {},
				scriptReturnCode: undefined,
			});

			expect(commands).to.be.an.instanceOf(CommandsStorage);
			expect(commands.isEmpty()).to.be.equal(true);
		});

		it('should create commands storage from definition', () => {
			script.before((storage) => {
				storage.cmd('pwd');
			});

			const commands = script.createBeforeCommands(runnerFactory, {
				project: new Project('a', './a'),
				env: {},
				scriptReturnCode: undefined,
			});

			expect(commands).to.be.an.instanceOf(CommandsStorage);
			expect(commands.isEmpty()).to.be.equal(false);
			expect(commands.getCommands()).to.have.lengthOf(1);
			expect(commands.getCommands()[0]).to.be.an.instanceOf(CmdCommand);
			expect(commands.getCommands()[0].name).to.be.equal('pwd');
		});

	});

	describe('createAfterCommands()', () => {

		it('should create empty commands storage', () => {
			const commands = script.createAfterCommands(runnerFactory, {
				project: new Project('a', './a'),
				env: {},
				scriptReturnCode: undefined,
			});

			expect(commands).to.be.an.instanceOf(CommandsStorage);
			expect(commands.isEmpty()).to.be.equal(true);
		});

		it('should create commands storage from definition', () => {
			script.after((storage) => {
				storage.cmd('pwd');
			});

			const commands = script.createAfterCommands(runnerFactory, {
				project: new Project('a', './a'),
				env: {},
				scriptReturnCode: undefined,
			});

			expect(commands).to.be.an.instanceOf(CommandsStorage);
			expect(commands.isEmpty()).to.be.equal(false);
			expect(commands.getCommands()).to.have.lengthOf(1);
			expect(commands.getCommands()[0]).to.be.an.instanceOf(CmdCommand);
			expect(commands.getCommands()[0].name).to.be.equal('pwd');
		});

	});

	describe('createCommands()', () => {

		it('should create empty commands storage', () => {
			const commands = script.createCommands(runnerFactory, {
				project: new Project('a', './a'),
				env: {},
				scriptReturnCode: undefined,
			});

			expect(commands).to.be.an.instanceOf(CommandsStorage);
			expect(commands.isEmpty()).to.be.equal(true);
		});

		it('should create commands storage from definition', () => {
			script = new Script('a', (storage) => {
				storage.cmd('pwd');
			});

			const commands = script.createCommands(runnerFactory, {
				project: new Project('a', './a'),
				env: {},
				scriptReturnCode: undefined,
			});

			expect(commands).to.be.an.instanceOf(CommandsStorage);
			expect(commands.isEmpty()).to.be.equal(false);
			expect(commands.getCommands()).to.have.lengthOf(1);
			expect(commands.getCommands()[0]).to.be.an.instanceOf(CmdCommand);
			expect(commands.getCommands()[0].name).to.be.equal('pwd');
		});

	});

});
