import {NativeFileReader} from '../../src/file-readers';
import {expect} from 'chai';


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

});
