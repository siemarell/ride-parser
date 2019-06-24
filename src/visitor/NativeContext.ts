import { getFunctionsDoc, getTypes, getVarsDoc, ISriptInfo, TFunction, TStruct, TType } from '@waves/ride-js';
import { TDeclaration, TFunctionDeclaration, TVaribleDeclaration } from './types';
import { binaryOperators, unaryOperators } from './operatorFunctions';
import { TTypeRef } from './TypeTable';
import { isStructType, typeToTypeRef } from './typeUtils';

const globalSymbols: Record<string, TDeclaration> = {...binaryOperators, ...unaryOperators};

export class NativeContext {
    variables: Record<string, TVaribleDeclaration>;
    functions: Record<string, TFunctionDeclaration | TFunctionDeclaration[]>;

    private static _instances: Record<string, NativeContext> = {};

    constructor(info: ISriptInfo) {
        const vDocs: Record<string, TVaribleDeclaration> = getVarsDoc(info.stdLibVersion, info.scriptType === 2)
            .reduce((acc, item) => ({...acc, [item.name]: {...item, value: null, type: typeToTypeRef(item.type)}}),
                {} as Record<string, TVaribleDeclaration>);
        this.variables = vDocs;


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

        const tDocs = getTypes(info.stdLibVersion, info.scriptType === 2);
        const typeConstructors = tDocs
            .map(x => x.type)
            .filter(isStructType)
            .map((x) => ({
                    name: x.typeName,
                    args: x.fields.map(x => ({...x, type: typeToTypeRef(x.type)})),
                    resultType: x.typeName,
                    value: null
                })
            ).reduce((acc, item) => ({...acc, [item.name]: item}), {} as Record<string, TFunctionDeclaration>);

        this.functions = {...fDocs, ...typeConstructors, ...globalSymbols};
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
        // FixMe: now simply gives first function. Should use arg types to determine correct function instead
        const decl = this.functions[name];
        return Array.isArray(decl) ?
            decl[0] :
            decl || null;
    }
}

// For some reason flat doesnt work with ts-node
Object.defineProperty(Array.prototype, 'flat', {
    value: function (depth: any = 1) {
        return this.reduce(function (flat: any, toFlatten: any) {
            return flat.concat((Array.isArray(toFlatten) && (depth > 1)) ? toFlatten.flat(depth - 1) : toFlatten);
        }, []);
    }
});

