import {EventEmitter} from '../src/event-emitter';
import {expect} from 'chai';


describe('#EventEmitter', () => {

	it('should emit and subscribe', () => {
		const emitter = new EventEmitter<string>();
		const emitted = [];

		emitter.subscribe((data) => {
			emitted.push(data);
		});

		emitter.subscribe((data) => {
			emitted.push(data);
		});

		emitter.emit('hello');
		emitter.emit('world');

		expect(emitted).to.be.eql([
			'hello', 'hello',
			'world', 'world',
		]);
	});

});
