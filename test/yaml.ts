import {readYamlConfiguration} from '../src/yaml';
import {YamlConfiguration} from '../src/definitions';
import {MockFileReader} from '../src/file-readers';
import {expect} from 'chai';


let reader: MockFileReader;


function readYaml(content: string): YamlConfiguration
{
	reader.files['config.yml'] = content;
	return readYamlConfiguration(reader, 'config.yml');
}


describe('#yaml', () => {

	beforeEach(() => {
		reader = new MockFileReader;
	});

	describe('readYamlConfiguration()', () => {

		it('should throw an error when projects are not defined', () => {
			expect(() => {
				readYaml('{}');
			}).to.throw(Error, 'Missing projects key in config.yml config file.');
		});

		it('should throw an error when projects are not valid', () => {
			expect(() => {
				readYaml('{projects: invalid}');
			}).to.throw(Error, 'Projects key in config.yml must be a list of projects.');
		});

		it('should throw an error when projects do not contain configuration', () => {
			expect(() => {
				readYaml('{projects: {a: invalid}}');
			}).to.throw(Error, 'Project a in config.yml must contain a configuration object.');
		});

		it('should throw an error if root is missing', () => {
			expect(() => {
				readYaml('{projects: {a: {}}}');
			}).to.throw(Error, 'Project a in config.yml must contain root path.');
		});

		it('should throw an error if root is not a string', () => {
			expect(() => {
				readYaml('{projects: {a: {root: []}}}');
			}).to.throw(Error, 'Root path for project a in config.yml must be a string.');
		});

		it('should throw an error if root does not exists', () => {
			expect(() => {
				readYaml('{projects: {a: {root: a}}}');
			}).to.throw(Error, 'Root path "a" for a in config.yml must be an existing directory.');
		});

		it('should throw an error if scripts are invalid', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: []}');
			}).to.throw(Error, 'Scripts in config.yml must be a list of scripts.');
		});

		it('should throw an error if scripts does not contain configuration', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: {a: invalid}}');
			}).to.throw(Error, 'Script a in config.yml must contain a configuration object.');
		});

		it('should throw an error if script mode is not a string', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: {a: {mode: []}}}');
			}).to.throw(Error, 'Mode for script a in config.yml must be a "series" or "parallel" string.');
		});

		it('should throw an error if script mode is invalid', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: {a: {mode: invalid}}}');
			}).to.throw(Error, 'Mode for script a in config.yml must be a "series" or "parallel" string, but "invalid" given.');
		});

		it('should throw an error if script environment is invalid type', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: {a: {environment: invalid}}}');
			}).to.throw(Error, 'Environment for script a in config.yml must be a list of environment variables.');
		});

		it('should throw an error if script environment item not a string', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: {a: {environment: {a: []}}}}');
			}).to.throw(Error, 'Environment variable a for script a in config.yml must be a string.');
		});

		it('should throw an error if required parent environment variable does not exists', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: {a: {environment: {a: <parent.env.IMBA_UNKNOWN_ENV>}}}}');
			}).to.throw(Error, 'Environment variable a for script a in config.yml requires parent environment IMBA_UNKNOWN_ENV which does not exists.');
		});

		it('should throw an error if script except is not an array', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: {a: {except: invalid}}}');
			}).to.throw(Error, 'Except for script a in config.yml must be a list of excluded project names.');
		});

		it('should throw an error if script except item is not a string', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: {a: {except: [[]]}}}');
			}).to.throw(Error, 'Except for script a in config.yml must contain only strings.');
		});

		it('should throw an error if script only is not an array', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: {a: {only: invalid}}}');
			}).to.throw(Error, 'Only for script a in config.yml must be a list of included project names.');
		});

		it('should throw an error if script only item is not a string', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: {a: {only: [[]]}}}');
			}).to.throw(Error, 'Only for script a in config.yml must contain only strings.');
		});

		it('should throw an error if script dependencies is not an array', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: {a: {dependencies: invalid}}}');
			}).to.throw(Error, 'Dependencies for script a in config.yml must be a list of other script names.');
		});

		it('should throw an error if script dependency item is not a string', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: {a: {dependencies: [[]]}}}');
			}).to.throw(Error, 'Dependencies for script a in config.yml must contain only strings.');
		});

		it('should throw an error if script projects is not a list', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: {a: {projects: invalid}}}');
			}).to.throw(Error, 'Projects for script a in config.yml must be a list of projects with their custom scripts.');
		});

		it('should throw an error if script projects does not contain configuration object', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: {a: {projects: {a: []}}}}');
			}).to.throw(Error, 'Project a for script a in config.yml must contain a configuration.');
		});

		it('should throw an error if script projects point to undefined project', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: {a: {projects: {a: {}}}}}');
			}).to.throw(Error, 'Project a defined for script a in config.yml was not defined in projects configuration.');
		});

		it('should throw an error if script is not an array', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: {a: {script: {}}}}');
			}).to.throw(Error, 'Script for script a in config.yml must be a string or an array of strings.');
		});

		it('should throw an error if script item is not a string', () => {
			expect(() => {
				readYaml('{projects: {}, scripts: {a: {script: [[]]}}}');
			}).to.throw(Error, 'Script for script a in config.yml must be a string or an array of strings.');
		});

		it('should parse projects', () => {
			reader.directories = ['a', 'b'];
			expect(readYaml('{projects: {a: {root: a}, b: {root: b}}}')).to.be.eql({
				projects: {
					a: {
						root: 'a',
					},
					b: {
						root: 'b',
					},
				},
				scripts: {},
			});
		});

		it('should parse scripts with string commands', () => {
			expect(readYaml('{projects: {}, scripts: {a: {before_script: before, after_script: after, script: do}}}')).to.be.eql({
				projects: {},
				scripts: {
					a: {
						mode: 'parallel',
						environment: {},
						except: [],
						only: [],
						dependencies: [],
						before_script: [
							'before',
						],
						after_script: [
							'after',
						],
						script: [
							'do',
						],
						projects: {},
					},
				},
			});
		});

		it('should parse scripts with array commands', () => {
			expect(readYaml('{projects: {}, scripts: {a: {before_script: [before], after_script: [after], script: [do]}}}')).to.be.eql({
				projects: {},
				scripts: {
					a: {
						mode: 'parallel',
						environment: {},
						except: [],
						only: [],
						dependencies: [],
						before_script: [
							'before',
						],
						after_script: [
							'after',
						],
						script: [
							'do',
						],
						projects: {},
					},
				},
			});
		});

		it('should parse scripts with series mode', () => {
			expect(readYaml('{projects: {}, scripts: {a: {mode: series}}}')).to.be.eql({
				projects: {},
				scripts: {
					a: {
						mode: 'series',
						environment: {},
						except: [],
						only: [],
						dependencies: [],
						before_script: [],
						after_script: [],
						script: [],
						projects: {},
					},
				},
			});
		});

		it('should parse scripts with custom environment', () => {
			expect(readYaml('{projects: {}, scripts: {a: {environment: {A: a, B: b}}}}')).to.be.eql({
				projects: {},
				scripts: {
					a: {
						mode: 'parallel',
						environment: {
							A: 'a',
							B: 'b',
						},
						except: [],
						only: [],
						dependencies: [],
						before_script: [],
						after_script: [],
						script: [],
						projects: {},
					},
				},
			});
		});

		it('should parse scripts with except list', () => {
			reader.directories = ['a'];
			expect(readYaml('{projects: {a: {root: a}}, scripts: {a: {except: [a]}}}')).to.be.eql({
				projects: {
					a: {
						root: 'a',
					},
				},
				scripts: {
					a: {
						mode: 'parallel',
						environment: {},
						except: [
							'a',
						],
						only: [],
						dependencies: [],
						before_script: [],
						after_script: [],
						script: [],
						projects: {},
					},
				},
			});
		});

		it('should parse scripts with only list', () => {
			reader.directories = ['a'];
			expect(readYaml('{projects: {a: {root: a}}, scripts: {a: {only: [a]}}}')).to.be.eql({
				projects: {
					a: {
						root: 'a',
					},
				},
				scripts: {
					a: {
						mode: 'parallel',
						environment: {},
						except: [],
						only: [
							'a',
						],
						dependencies: [],
						before_script: [],
						after_script: [],
						script: [],
						projects: {},
					},
				},
			});
		});

		it('should parse scripts with dependencies', () => {
			expect(readYaml('{projects: {}, scripts: {a: {}, b: {dependencies: [a]}}}')).to.be.eql({
				projects: {},
				scripts: {
					a: {
						mode: 'parallel',
						environment: {},
						except: [],
						only: [],
						dependencies: [],
						before_script: [],
						after_script: [],
						script: [],
						projects: {},
					},
					b: {
						mode: 'parallel',
						environment: {},
						except: [],
						only: [],
						dependencies: [
							'a',
						],
						before_script: [],
						after_script: [],
						script: [],
						projects: {},
					},
				},
			});
		});

		it('should parse scripts with project scripts', () => {
			reader.directories = ['a'];
			expect(readYaml('{projects: {a: {root: a}}, scripts: {a: {projects: {a: {script: echo "hello"}}}}}')).to.be.eql({
				projects: {
					a: {
						root: 'a',
					},
				},
				scripts: {
					a: {
						mode: 'parallel',
						environment: {},
						except: [],
						only: [],
						dependencies: [],
						before_script: [],
						after_script: [],
						script: [],
						projects: {
							a: {
								before_script: [],
								after_script: [],
								script: [
									'echo "hello"',
								],
							},
						},
					},
				},
			});
		});

	});

});
