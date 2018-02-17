import {Command} from '../src/command';
import {expect} from 'chai';


describe('#Command', () => {

	it('should create new command', () => {
		const command = new Command('pwd');
		expect(command.command).to.be.equal('pwd');
	});

});
