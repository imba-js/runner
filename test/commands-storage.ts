import {CommandsStorage} from '../src/commands-storage';
import {Command} from '../src/command';
import {expect} from 'chai';


let storage: CommandsStorage;


describe('#CommandsStorage', () => {

	beforeEach(() => {
		storage = new CommandsStorage;
	});

	it('should work with commands storage', () => {
		expect(storage.isEmpty()).to.be.equal(true);
		expect(storage.getCommands()).to.be.eql([]);

		storage.cmd('pwd');

		expect(storage.isEmpty()).to.be.equal(false);
		expect(storage.getCommands()).to.have.length(1);
		expect(storage.getCommands()[0]).to.be.an.instanceOf(Command);
		expect(storage.getCommands()[0].command).to.be.equal('pwd');
	});

});
