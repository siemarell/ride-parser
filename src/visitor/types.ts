import { TTypeRef } from './TypeTable';

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

export type TFieldAccess = {
    position: TPos
    item: TRef | TFunctionCall
    fieldAccess: string
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
    match: Exclude<TAstNode, TLiteral>,
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

export type TAstNode = TRef | TLiteral | TFieldAccess | TFunctionCall | TMatch | TIfElse


// DECLARATION TYPES
export type TVaribleDeclaration = {
    position: TPos,
    name: string,
    type: TTypeRef,
    value: any,
}

export type TFunctionArgDeclaration = {name: string, type: TTypeRef}

export type TFunctionDeclaration = {
    position: TPos
    name: string
    args: TFunctionArgDeclaration[]
    resultType: TTypeRef
    value: any
}

// export type TFunctionDeclarationGeneric = (...args: TTypeRef[]) => TFunctionDeclarationBasic
// export type TFunctionDeclaration = TFunctionDeclarationBasic | TFunctionDeclarationGeneric
export type TDeclaration = TVaribleDeclaration | TFunctionDeclaration