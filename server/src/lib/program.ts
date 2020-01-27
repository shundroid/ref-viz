import Scope from './declaration'
export default class Program {
  constructor(public filePath: string, public scope: Scope) { }
}
