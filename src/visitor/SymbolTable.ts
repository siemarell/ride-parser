import { TDeclaration } from './types';

export class SymbolTable {
    children: SymbolTable[] = [];
    values: Record<string, TDeclaration> = {};

    constructor(public parent?: SymbolTable) {
        if (parent != null) {
            parent.children.push(this);
        }
    }
    addDeclaration(decl: TDeclaration, overload = false) {
        if (this.values[decl.name] != null && !overload) {
            throw new Error("Duplicate Identifier");
        } else {
            this.values[decl.name] = decl;
        }
    }

    getDeclarationByName(name: string): TDeclaration | null {
        return this.values[name] ||
            (this.parent && this.parent.getDeclarationByName(name));
    }

    _getDeclByName(name: string) {
        return this.values[name] || (this.parent && this.parent.getDeclarationByName(name));
    }
}

