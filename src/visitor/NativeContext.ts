import { getFunctionsDoc, getVarsDoc, ISriptInfo, TType } from '@waves/ride-js';
import { TDeclaration } from './types';
import { binaryOperators, unaryOperators } from './operatorFunctions';

const globalSymbols: Record<string, TDeclaration> = {...binaryOperators, ...unaryOperators};

export class NativeContext {
    values: Record<string, any>;

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
        this.values = {...fDocs, ...vDocs, ...globalSymbols};
    }

    static for(info: ISriptInfo): NativeContext {
        const key = `${info.contentType}-${info.scriptType}-${info.stdLibVersion}`;
        if (!this._instances[key]) {
            this._instances[key] = new NativeContext(info)
        }
        return this._instances[key];
    }
}

export type TNativeVar = {
    name: string,
    doc: string,
    type: TType
}

export type TFunctionArgument = {
    name: string
    type: TType
    doc: string
};

export type TNativeFunc = {
    name: string
    doc: string
    resultType: TType
    args: TFunctionArgument[]
};

export type TNativeItem = TNativeVar | TNativeFunc