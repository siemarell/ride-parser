import {TType, TPrimitive, TUnion, TStruct, TFunction, TFunctionArgument} from '@waves/ride-js'

export type TPos = {
    startOffset: number,
    endOffset: number,
    startLine: number,
    endLine: number,
    startColumn: number,
    endColumn: number,
}

type TRange = {
    start: TPos
    end: TPos
}

// export interface INode {
//     range: TRange
// }
export type TRef = string
// export interface IFunctionCall {
//     kind: 'FUNCTION_CALL'
// }
//
// export interface IFieldAccess {
//     kind: 'FIELD_ACCESS'
// }
//
// export interface IIfElse {
//     kind: 'IF_ELSE'
// }
//
// export interface IMatch {
//     kind: 'MATCH'
// }
//
// export interface IMatchCase {
//     kind: 'MATCH_CASE'
// }

export type TFieldAccess = {
    position: TPos
    item: TRef | TFunctionCall
    fieldAccess: string
}

export type TFunctionCall = {
    position: TPos,
    func: TRef,
    args: TRef[]
}

export type TVaribleDeclaration = {
    position: TPos,
    name: string,
    type: TType,
    value: any,
}

export type TFunctionDeclaration = {
    position: TPos
    name: string
    args: {name: string, type: TType}[]
    resultType: TType
    value: any
}

export type TDeclaration = TVaribleDeclaration | TFunctionDeclaration
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