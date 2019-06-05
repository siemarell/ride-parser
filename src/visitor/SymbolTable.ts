import { TDeclaration, TFunctionDeclaration, TVaribleDeclaration, WithPosition } from './types';

export class SymbolTable {
    children: SymbolTable[] = [];
    variables: Record<string, TVaribleDeclaration & WithPosition> = {};
    functions: Record<string, TFunctionDeclaration & WithPosition> = {};

    constructor(public parent?: SymbolTable) {
        if (parent != null) {
            parent.children.push(this);
        }
    }
    addVariable(decl: TVaribleDeclaration & WithPosition) {
        if (this.variables[decl.name] != null ) {
            throw new Error("Duplicate Identifier");
        } else {
            this.variables[decl.name] = decl;
        }
    }

    addFunction(decl: TFunctionDeclaration & WithPosition) {
        if (this.functions[decl.name] != null ) {
            throw new Error("Duplicate Identifier");
        } else {
            this.functions[decl.name] = decl;
        }
    }

    varByName(name: string): TVaribleDeclaration | null {
        return this.variables[name] ||
            (this.parent && this.parent.varByName(name));
    }

    funcByName(name: string): TFunctionDeclaration | null {
        return this.functions[name] ||
            (this.parent && this.parent.funcByName(name));
    }

}

