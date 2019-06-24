import { TList, TStruct, TType } from '@waves/ride-js';
import { TTypeRef } from './TypeTable';

export const isListType = (t?: TType | null): t is TList => t != null && typeof t === 'object' && 'listOf' in t;

export const isStructType = (t?: TType | null): t is TStruct => t !=null && typeof t === 'object' && 'fields' in t;

export function typeToTypeRef(x: TType): TTypeRef {
    if (typeof x === 'string') return x;
    else if (Array.isArray(x)) return x.map(typeToTypeRef).flat();
    else if ('listOf' in x) return `List[${typeToTypeRef(x.listOf)}]`;
    else return x.typeName;
}
