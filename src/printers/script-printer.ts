import {Printer} from './printer';
import {ScriptRunner} from '../script-runners';


export abstract class ScriptPrinter extends Printer
{


	public abstract enablePrinter(runner: ScriptRunner): void;

}
