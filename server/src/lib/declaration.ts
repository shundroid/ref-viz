import Reference from "./reference";

export default class Scope {
  id: number | null
  name: string | null
  items: (Scope | Reference)[]
  isDeclaration: boolean;
  options: any;
  constructor(name = null, items = []) {
    this.id = null
    this.name = name
    this.items = items
    this.isDeclaration = true
    this.options = {}
  }
  add(item) {
    this.items.push(item)
  }
  merge(scope: Scope) {
    this.items.push(...scope.items)
  }
}
