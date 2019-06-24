import { intersectionWith,reduce } from 'ramda';
import { TType, TStructField, ISriptInfo, getTypes } from '@waves/ride-js';
import { isStructType } from './typeUtils';

export type TTypeRef = string | string[]

export class TypeTable {
    private _values: Record<string, TType> = {};

    private static _instances: Record<string, TypeTable> = {};

    static for(info: ISriptInfo): TypeTable {
        const key = `${info.contentType}-${info.scriptType}-${info.stdLibVersion}`;
        if (!this._instances[key]) {
            const tTable = new TypeTable();
            const tDocs = getTypes(info.stdLibVersion, info.scriptType === 2);
            tDocs.forEach(({name, type}) => tTable.addDefinition(name, type));
            this._instances[key] = tTable;
        }
        return this._instances[key];
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

    addDefinition(name: string, value: TType) {
        this._values[name] = value;
    }

    getDefinition(name: string): TType | null {
        return this._values[name] || null;
    }

    getTypeFields(type: TTypeRef): TStructField[] {
        const arg = Array.isArray(type) ? type.map(this._getTypeFields) : [this._getTypeFields(type)];
        if (arg.length === 1) return arg[0];
        return arg.slice(1).reduce((acc, item) => intersectionWith((a,b) => a.name === b.name ,acc, item), arg[0]);

    }

    private _getTypeFields(type: string): TStructField[] {
        const t = this.getDefinition(type);
        if (isStructType(t)) return t.fields;
        return []
    }
}