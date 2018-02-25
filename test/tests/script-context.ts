import {ScriptContext} from '../../src/script-context';
import {CmdCommand} from '../../src/commands';
import {MockRunnerFactory} from '../../src/runners';
import {expect} from 'chai';


let scriptCtx: ScriptContext;


describe('#ScriptContext', () => {

	beforeEach(() => {
		scriptCtx = new ScriptContext(new MockRunnerFactory);
	});

	it('should work with commands storage', () => {
		expect(scriptCtx.isEmpty()).to.be.equal(true);
		expect(scriptCtx.getCommands()).to.be.eql([]);

		scriptCtx.cmd('pwd');

		expect(scriptCtx.isEmpty()).to.be.equal(false);
		expect(scriptCtx.getCommands()).to.have.length(1);
		expect(scriptCtx.getCommands()[0]).to.be.an.instanceOf(CmdCommand);
		expect(scriptCtx.getCommands()[0].name).to.be.equal('pwd');
	});

});
