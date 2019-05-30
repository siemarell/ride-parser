import { TDeclaration } from './types';
import { binaryOperators, unaryOperators } from './operatorFunctions';


const globalSymbols: Record<string, TDeclaration> = { ...binaryOperators, ...unaryOperators};

export default class SymbolTable {
    children: SymbolTable[] = [];
    values: Record<string, TDeclaration> = {};

    constructor(public parent?: SymbolTable) {
        if (parent != null){
            parent.children.push(this);
        }
    }

    addDeclaration(decl: TDeclaration){
        if(this.values[decl.name] != null){
            console.error("Duplicate Identifier");
        }else {
            this.values[decl.name] = decl;
        }
    }

    getDeclarationByName(name: string): TDeclaration | null{
        return globalSymbols[name] ||
            this.values[name] ||
            (this.parent && this.parent.getDeclarationByName(name))
    }

    _getDeclByName(name: string){
        return this.values[name] || (this.parent && this.parent.getDeclarationByName(name))
    }
}