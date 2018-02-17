import {NativeFileReader} from '../../src/file-readers';
import {expect} from 'chai';
import * as path from 'path';


let reader: NativeFileReader;


describe('#FileReaders/NativeFileReader', () => {

	beforeEach(() => {
		reader = new NativeFileReader;
	});

	describe('isFile()', () => {

		it('should check if path is an existing file', () => {
			expect(reader.isFile(__filename)).to.be.equal(true);
			expect(reader.isFile(__dirname)).to.be.equal(false);
		});

	});

	describe('isDirectory()', () => {

		it('should check if path is an existing directory', () => {
			expect(reader.isDirectory(__filename)).to.be.equal(false);
			expect(reader.isDirectory(__dirname)).to.be.equal(true);
		});

	});

	describe('require()', () => {

		it('should require a js file', () => {
			expect(reader.require(path.resolve(__dirname, '_data', 'require_from_js.js'))).to.be.equal('hello world');
		});

		it('should require a ts file', () => {
			expect(reader.require(path.resolve(__dirname, '_data', 'require_from_ts.ts'))).to.be.equal('hello world');
		});

	});

});
