import {Runner} from './runner';
import {EnvList} from '../environment-variable';


export interface RunnerFactory
{


	createRunner(root: string, command: string, environment: EnvList): Runner;

}
