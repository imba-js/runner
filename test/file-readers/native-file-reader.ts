import {NativeFileReader} from '../../src/file-readers';
import {expect} from 'chai';
import * as path from 'path';


let reader: NativeFileReader;


describe('#FileReaders/NativeFileReader', () => {

	beforeEach(() => {
		reader = new NativeFileReader;
	});

	describe('readFile()', () => {

		it('should read file', () => {
			expect(reader.readFile(path.join(__dirname, '_data', 'readFile.txt'))).to.be.equal('hello world');
		});

	});

	describe('isDirectory()', () => {

		it('should check if path is an existing directory', () => {
			expect(reader.isDirectory(__filename)).to.be.equal(false);
			expect(reader.isDirectory(__dirname)).to.be.equal(true);
		});

	});

});
