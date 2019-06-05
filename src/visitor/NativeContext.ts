import { getFunctionsDoc, getVarsDoc, ISriptInfo, TFunction, TType } from '@waves/ride-js';
import { TDeclaration, TFunctionDeclaration, TVaribleDeclaration } from './types';
import { binaryOperators, unaryOperators } from './operatorFunctions';
import { TTypeRef } from './TypeTable';

const globalSymbols: Record<string, TDeclaration> = {...binaryOperators, ...unaryOperators};

export class NativeContext {
    variables: Record<string, TVaribleDeclaration>;
    functions: Record<string, TFunctionDeclaration | TFunctionDeclaration[]>;

    private static _instances: Record<string, NativeContext> = {};

    constructor(info: ISriptInfo) {
        const fDocs = getFunctionsDoc(info.stdLibVersion, info.scriptType === 2).reduce((acc, item) => {
            const nativeFunc = {
                resultType: typeToTypeRef(item.resultType),
                args: item.args.map(arg => ({...arg, type: typeToTypeRef(arg.type)})),
                doc: item.doc,
                name: item.name
            };
            if (nativeFunc.name in acc) {
                if (!Array.isArray(acc[nativeFunc.name])) acc[nativeFunc.name] = [acc[nativeFunc.name]];
                acc[nativeFunc.name].push(nativeFunc);
            } else {
                acc[nativeFunc.name] = nativeFunc;
            }
            return acc;
        }, {} as any);
        const vDocs = getVarsDoc(info.stdLibVersion, info.scriptType === 2).reduce((acc, item) => {
            acc[item.name] = {...item, type: typeToTypeRef(item.type)};
            return acc;
        }, {} as any);
        this.variables = vDocs;
        this.functions = {...fDocs, ...globalSymbols};
    }

    static for(info: ISriptInfo): NativeContext {
        const key = `${info.contentType}-${info.scriptType}-${info.stdLibVersion}`;
        if (!this._instances[key]) {
            this._instances[key] = new NativeContext(info);
        }
        return this._instances[key];
    }

    varByName(name: string): TVaribleDeclaration | null {
        return this.variables[name] || null;
    }

    funcBySignature(name: string, argTypes: TTypeRef[]): TFunctionDeclaration | null {
        const decl = this.functions[name];
        return Array.isArray(decl) ?
            decl[0] :
            decl || null
    }
}
// For some reason flat doesnt work with ts-node
Object.defineProperty(Array.prototype, 'flat', {
    value: function(depth:any = 1) {
        return this.reduce(function (flat: any, toFlatten: any) {
            return flat.concat((Array.isArray(toFlatten) && (depth>1)) ? toFlatten.flat(depth-1) : toFlatten);
        }, []);
    }
})

function typeToTypeRef(x: TType): TTypeRef {
    if (typeof x === 'string') return x;
    else if (Array.isArray(x)) return x.map(typeToTypeRef).flat();
    else if ('listOf' in x) return `List[${typeToTypeRef(x.listOf)}]`;
    else return x.typeName;
}