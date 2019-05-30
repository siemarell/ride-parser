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
export type TRef = {
    position: TPos
    ref: string
}
export type TLiteral = {
    position: TPos,
    type: string,
    value: any
}
export type TFieldAccess = {
    position: TPos
    item: TRef | TFunctionCall
    fieldAccess: string
}

export type TFunctionCall = {
    position: TPos,
    func: string,
    args: TRef[]
}

export type TVaribleDeclaration = {
    position: TPos,
    name: string,
    type: TType,
    value: any,
}

export type TFunctionArgDeclaration = {name: string, type: TType}
export type TFunctionDeclarationBasic = {
    position: TPos
    name: string
    args: TFunctionArgDeclaration[]
    resultType: TType
    value: any
}
export type TFunctionDeclarationGeneric = (...args: TType[]) => TFunctionDeclarationBasic
export type TFunctionDeclaration = TFunctionDeclarationBasic | TFunctionDeclarationGeneric
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