import { TPrimitive, TType, getVarsDoc, getFunctionsDoc } from '@waves/ride-js';

export type TTypeRef = string | string[]

export class TypeSymbolTable {
    private _values: Record<string, TType> = {};

    addDefinition(name: string, value: TType) {
        this._values[name] = value;
    }

    getDefinition(name: string): TType | null {
        return this._values[name] || null;
    }


    static union(...types: (TTypeRef | TTypeRef[])[]): TTypeRef {
        const resultType: string[] = [];

        function go(x: TTypeRef) {
            if (Array.isArray(x)) {
                x.forEach(go);
            } else {
                if (!resultType.includes(x)) {
                    resultType.push(x);
                }
            }
        }

        types.forEach(go);

        if (resultType.length === 0) return 'Unit';
        else if (resultType.length === 1) return resultType[0];
        return resultType;
    }
}