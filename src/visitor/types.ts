import { TTypeRef } from './TypeTable';
import { TList, TType } from '@waves/ride-js';

export const isListType = (t?: TType | null): t is TList => t != null && typeof t === 'object' && 'listOf' in t;

// Metadata types
export type TError = {
    position: TPos,
    message: string
}
export type TPos = {
    startOffset: number,
    endOffset: number,
    startLine: number,
    endLine: number,
    startColumn: number,
    endColumn: number,
}

export type WithPosition = {
    position: TPos
}
// AST Types
export type TRef = {
    position: TPos
    ref: string
    type: TTypeRef
}

export type TLiteral = {
    position: TPos,
    value: any
    type: TTypeRef,
}

export type TListLiteral = {
    position: TPos,
    items: TAstNode[],
    type: TTypeRef
}

export type TFieldAccess = {
    position: TPos
    item: Exclude<TAstNode, TLiteral | TListLiteral>
    fieldAccess: string
    type: TTypeRef
}

export type TListAccess = {
    position: TPos
    item: TAstNode
    listAccess: number | string
    type: TTypeRef
}

export type TFunctionCall = {
    position: TPos,
    func: string,
    args: TAstNode[]
    type: TTypeRef
}

export type TMatch = {
    position: TPos,
    match: Exclude<TAstNode, TLiteral | TListLiteral>,
    cases: TMatchCase[],
    type: TTypeRef
}

export type TMatchCase = {
    position: TPos,
    caseName: string,
    caseType: string | null
    caseValue: TAstNode
}

export type TIfElse = {
    position: TPos,
    condition: TAstNode,
    thenValue: TAstNode,
    elseValue: TAstNode
    type: TTypeRef
}

export type TAstNode = TRef | TLiteral | TListLiteral | TListAccess | TFieldAccess | TFunctionCall | TMatch | TIfElse


// DECLARATION TYPES
export type TVaribleDeclaration = {
   // position: TPos,
    name: string,
    type: TTypeRef,
    value: TAstNode | null,
}

export type TFunctionArgDeclaration = {name: string, type: TTypeRef}

export type TFunctionDeclaration = {
    //position: TPos
    name: string
    args: TFunctionArgDeclaration[]
    resultType: TTypeRef
    value: TAstNode
}

// export type TFunctionDeclarationGeneric = (...args: TTypeRef[]) => TFunctionDeclarationBasic
// export type TFunctionDeclaration = TFunctionDeclarationBasic | TFunctionDeclarationGeneric
export type TDeclaration = TVaribleDeclaration | TFunctionDeclaration