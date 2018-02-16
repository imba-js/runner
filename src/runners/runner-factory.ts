import {Runner} from './runner';
import {CommandEnvList} from '../command';


export interface RunnerFactory
{


	createRunner(root: string, command: string, environment: CommandEnvList): Runner;

}
