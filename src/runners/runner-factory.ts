import {Runner} from './runner';
import {ImbaEnvironmentScriptConfiguration} from '../definitions';


export interface RunnerFactory
{


	createRunner(root: string, command: string, environment: ImbaEnvironmentScriptConfiguration): Runner;

}
