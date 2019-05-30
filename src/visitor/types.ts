import {TType, TPrimitive, TUnion, TStruct, TFunction, TFunctionArgument} from '@waves/ride-js'

type TPos = {
    row: number
    col: number
}
type TRange = {
    start: TPos
    end: TPos
}

// export interface INode {
//     range: TRange
// }
export interface IReference {
    kind: 'REFERENCE'
}

export interface IFunctionCall {
    kind: 'FUNCTION_CALL'
}

export interface IFieldAccess {
    kind: 'FIELD_ACCESS'
}

export interface IIfElse {
    kind: 'IF_ELSE'
}

export interface IMatch {
    kind: 'MATCH'
}

export interface IMatchCase {
    kind: 'MATCH_CASE'
}

export interface IDeclaration {
    position: TRange
    name: string
    type: TType | TFunction
    value: any
}

//
// export interface IFunctionDeclaration extends IDeclaration {
//     type:  TFunction
// }
//
// export interface IVariableDeclaration extends IDeclaration{
//     type: TType
// }
//
// export type TDeclaration = IFunctionDeclaration | IVariableDeclaration