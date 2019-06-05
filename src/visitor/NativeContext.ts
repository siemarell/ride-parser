import { getFunctionsDoc, getVarsDoc, ISriptInfo, TFunction, TType } from '@waves/ride-js';
import { TDeclaration } from './types';
import { binaryOperators, unaryOperators } from './operatorFunctions';

const globalSymbols: Record<string, TDeclaration> = {...binaryOperators, ...unaryOperators};

export class NativeContext {
    variables: Record<string, TNativeVar>;
    functions: Record<string, TFunction>;

    private static _instances: Record<string, NativeContext> = {};

    constructor(info: ISriptInfo) {
        const fDocs = getFunctionsDoc(info.stdLibVersion, info.scriptType === 2).reduce((acc, item) => {
            if (item.name in acc) {
                if (!Array.isArray(acc[item.name])) acc[item.name] = [acc[item.name]];
                acc[item.name].push(item);
            } else {
                acc[item.name] = item;
            }
            return acc;
        }, {} as any);
        const vDocs = getVarsDoc(info.stdLibVersion, info.scriptType === 2).reduce((acc, item) => {
            acc[item.name] = item;
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

    varByName(name: string): TNativeVar | null {
        return this.variables[name] || null
    }

    funcByName(name: string): TFunction | null {
        return this.functions[name] || null
    }
}

export type TNativeVar = {
    name: string,
    doc: string,
    type: TType
}
