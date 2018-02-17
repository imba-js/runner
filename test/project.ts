import {Project} from '../src/project';
import {expect} from 'chai';


describe('#Project', () => {

	it('should create new project instance', () => {
		const project = new Project('a', './a');

		expect(project.name).to.be.equal('a');
		expect(project.root).to.be.equal('./a');
	});

});
