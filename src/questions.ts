import {Input} from './input';
import {Output} from './outputs';
import {CommandEnvList} from './command';
import * as readline from 'readline';
import * as _ from 'lodash';


export class Questions
{


	private output: Output;


	constructor(output: Output)
	{
		this.output = output;
	}


	public async askQuestions(inputs: Array<Input>): Promise<CommandEnvList>
	{
		const result: CommandEnvList = {};
		const output = this.output;

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		async function askQuestion(input: Input): Promise<string>
		{
			return new Promise<string>((resolve) => {
				const meta: Array<string> = [];

				if (input.required) {
					meta.push('required');
				}

				if (!_.isUndefined(input.defaultValue)) {
					meta.push(`default: ${input.defaultValue}`);
				}

				rl.question(`${input.question}${meta.length ? ' [' + meta.join(', ') + ']' : ''}: `, (answer) => {
					answer = answer.trim();

					if (input.required && answer === '') {
						output.log('This question is required.');
						resolve(askQuestion(input));
					} else {
						if (answer === '' && !_.isUndefined(input.defaultValue)) {
							answer = input.defaultValue;
						}

						resolve(answer);
					}
				});
			});
		}

		for (let i = 0; i < inputs.length; i++) {
			result[inputs[i].name] = await askQuestion(inputs[i]);
		}

		rl.close();

		return result;
	}

}
