import {createScriptEnvironment, EnvironmentVariable} from '../src/environment-variable';
import {expect} from 'chai';


describe('#createScriptEnvironment()', () => {

	it('should create script environments', () => {
		const env = createScriptEnvironment([
			new EnvironmentVariable('A', 'a'),
		], {
			B: 'b',
		}, {
			C: 'c',
		});

		const expected = {
			A: 'a',
			B: 'b',
			C: 'c',
		};

		if (process.env.PATH) {
			expected['PATH'] = process.env.PATH;
		}

		expect(env).to.be.eql(expected);
	});

});

describe('#EnvironmentVariable', () => {

	it('should create environment variable', () => {
		const env = new EnvironmentVariable('A', 'a');

		expect(env.name).to.be.equal('A');
		expect(env.value).to.be.equal('a');
	});

});
