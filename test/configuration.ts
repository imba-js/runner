import {MockFileReader} from '../src/file-readers';
import {configFileLookup, loadImbaFromFile} from '../src/configuration';
import {Imba} from '../src/imba';
import {expect} from 'chai';


let fileReader: MockFileReader;


describe('#configFileLookup()', () => {

	beforeEach(() => {
		fileReader = new MockFileReader;
	});

	it('should return the requested file if it exists', () => {
		fileReader.files['config.js'] = {};
		expect(configFileLookup(fileReader, 'config.js')).to.be.equal('config.js');
	});

	it('should return undefined if requesting file with not allowed extension', () => {
		expect(configFileLookup(fileReader, 'config.yml')).to.be.equal(undefined);
	});

	it('should return undefined if file with allowed extension was found', () => {
		fileReader.files['config.yml'] = {};
		expect(configFileLookup(fileReader, 'config')).to.be.equal(undefined);
	});

	it('should lookup allowed js file', () => {
		fileReader.files['config.js'] = {};
		expect(configFileLookup(fileReader, 'config')).to.be.equal('config.js');
	});

	it('should lookup allowed ts file', () => {
		fileReader.files['config.ts'] = {};
		expect(configFileLookup(fileReader, 'config')).to.be.equal('config.ts');
	});

});

describe('#loadImbaFromFile()', () => {

	beforeEach(() => {
		fileReader = new MockFileReader;
	});

	it('should throw an error if file does not export Imba object', () => {
		fileReader.files['config.js'] = {};

		expect(() => {
			loadImbaFromFile(fileReader, 'config.js');
		}).to.throw(Error, 'config.js must export instance of Imba class.');
	});

	it('should load a config', () => {
		fileReader.files['config.js'] = new Imba;
		const imba = loadImbaFromFile(fileReader, 'config.js');

		expect(imba).to.be.an.instanceOf(Imba);
	});

});
