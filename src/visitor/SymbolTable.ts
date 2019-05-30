import { TDeclaration } from './types';

export default class SymbolTable {
    children: SymbolTable[] = [];
    values: Record<string, TDeclaration> = {};

    constructor(public parent?: SymbolTable) {
        if (parent != null){
            parent.children.push(this)
        }
    }

    addDeclaration(decl: any){
        if(this.values[decl.name]!==null){
            console.error("Duplicate Identifier")
        }else {
            this.values[decl.name] = decl
        }
    }
}