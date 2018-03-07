import {MockChildProcessFactory} from '@imba/spawn';
import {ScriptContext} from '../../src/script-context';
import {Script} from '../../src/script';
import {CmdCommand} from '../../src/commands';
import {Imba} from '../../src';
import {expect} from 'chai';


let scriptCtx: ScriptContext;


describe('#ScriptContext', () => {

	beforeEach(() => {
		const imba = new Imba;
		scriptCtx = new ScriptContext(imba, new MockChildProcessFactory, new Script(imba, '', () => {}));
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
