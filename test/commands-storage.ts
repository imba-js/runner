import {CommandsStorage} from '../src/commands-storage';
import {CmdCommand} from '../src/commands';
import {MockRunnerFactory} from '../src/runners';
import {expect} from 'chai';


let storage: CommandsStorage;


describe('#CommandsStorage', () => {

	beforeEach(() => {
		storage = new CommandsStorage(new MockRunnerFactory);
	});

	it('should work with commands storage', () => {
		expect(storage.isEmpty()).to.be.equal(true);
		expect(storage.getCommands()).to.be.eql([]);

		storage.cmd('pwd');

		expect(storage.isEmpty()).to.be.equal(false);
		expect(storage.getCommands()).to.have.length(1);
		expect(storage.getCommands()[0]).to.be.an.instanceOf(CmdCommand);
		expect(storage.getCommands()[0].name).to.be.equal('pwd');
	});

});
