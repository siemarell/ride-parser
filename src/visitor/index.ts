import {
    getFunctionsDoc,
    getVarsDoc,
    scriptInfo,
    getTypes,
    TFunctionArgument,
    TFunction,
    ISriptInfo, TList
} from '@waves/ride-js';

import { rideParser } from '../parser';
import { SymbolTable } from './SymbolTable';
import { TypeTable, TTypeRef } from './TypeTable';
import {
    isListType,
    TAstNode, TDeclaration,
    TError,
    TFieldAccess, TFunctionArgDeclaration,
    TFunctionCall,
    TFunctionDeclaration, TIfElse, TListAccess, TListLiteral,
    TLiteral, TMatch, TMatchCase,
    TRef,
    TVaribleDeclaration, WithPosition
} from './types';
import { CstNode } from 'chevrotain';
import { NativeContext } from './NativeContext';
import { IntegerLiteral } from '../tokens';

const RideVisitorConstructor = rideParser.getBaseCstVisitorConstructor();

function extractPosition(token: any) {
    return {
        startOffset: token.startOffset,
        endOffset: token.endOffset,
        startLine: token.startLine,
        endLine: token.endLine,
        startColumn: token.startColumn,
        endColumn: token.endColumn,
    };
}

function extractRangePosition(tokenStart: any, tokenEnd: any) {
    return {
        startOffset: tokenStart.startOffset,
        endOffset: tokenEnd.endOffset,
        startLine: tokenStart.startLine,
        endLine: tokenEnd.endLine,
        startColumn: tokenStart.startColumn,
        endColumn: tokenEnd.endColumn,
    };
}

export class RideVisitor extends RideVisitorConstructor {
    nativeContext: NativeContext;

    rootSymbolTable: SymbolTable = new SymbolTable();

    symbolTableStack = [this.rootSymbolTable];

    typeTable: TypeTable;

    errors: TError[] = [];

    constructor(info: ISriptInfo) {
        super();
        this.typeTable = TypeTable.for(info);
        this.nativeContext = NativeContext.for(info);


        // This helper will detect any missing or redundant methods on this visitor
        this.validateVisitor();
    }

    get currentSymbolTable() {
        return this.symbolTableStack[this.symbolTableStack.length - 1];
    }

    private $CHECK_ARGUMENTS(declaredArgs: TFunctionArgDeclaration[], actualArgs: TAstNode[]) {
        //ToDo: implement
    }

    private $DEFINE_TYPE(typelessNode:
                             | Omit<TFunctionCall, "type">
                             | Omit<TFieldAccess, "type">
                             | Omit<TRef, "type">
                             | Omit<TListAccess, "type">
                             | TIfElse
                             | TMatch
                             | TLiteral
    ): TTypeRef {
        if ('func' in typelessNode) {
            const {func, args} = typelessNode;
            let decl = this.nativeContext.funcBySignature(func, args.map(arg => arg.type))
                || this.currentSymbolTable.funcByName(typelessNode.func);

            if (decl == null) {
                const {position} = typelessNode;
                this.errors.push({
                    position,
                    message: `Unresolved identifier '${typelessNode.func}`
                });
                return 'Unknown';
            } else {

                if (typeof decl === 'function')
                    decl = (decl as any)(...typelessNode.args.map(arg => arg && arg.type)) as TFunctionDeclaration;

                this.$CHECK_ARGUMENTS(decl.args, typelessNode.args);
                return decl!.resultType as any;
            }
        }
        else if ('ref' in typelessNode) {
            const vName = typelessNode.ref;
            const decl = this.nativeContext.varByName(vName) || this.currentSymbolTable.varByName(vName);
            if (decl == null) {
                const {position} = typelessNode;
                this.errors.push({
                    position,
                    message: `Unresolved identifier '${typelessNode.ref}`
                });
                return 'Unknown';
            } else {
                return decl.type as any;
            }
        }
        else if ('fieldAccess' in typelessNode) {
            // const {item, fieldAccess, position} = typelessNode;
            // const type = ;

            // Todo: make field incersection on unions and check types for existance
            return 'DefineType not implemented for FIELD_ACCESS';
        } else if ('listAccess' in typelessNode) {
            const {item} = typelessNode;
            if (Array.isArray(item.type) || !isListType(this.typeTable.getDefinition(item.type))){
                this.errors.push({
                    position: item.position,
                    message: `Item should be of type List[T]. Got ${item.type} instead`
                });
                return 'Unknown'
            }else {
                const itemType = this.typeTable.getDefinition(item.type) as TList;
                return itemType.listOf as TTypeRef
            }
        } else return typelessNode.type;
    }

    private $BINARY_OPERATION = (cst: any): TAstNode => {
        const leftResult = this.visit(cst.LHS);
        if (cst.RHS) {
            const rightResult = this.visit(cst.RHS);
            const op = cst.OPERATOR[0];

            const typelessFunctionCall = {
                position: extractPosition(op),
                func: op.image,
                args: [leftResult, rightResult]
            };
            return {
                ...typelessFunctionCall,
                type: this.$DEFINE_TYPE(typelessFunctionCall)
            };
        } else return leftResult;
    };

    $visitArr(nodes: CstNode[], opts?: any) {
        return (nodes || []).map((node: any) => super.visit(node, opts));
    }

    DAPP(cst: any) {
        this.$visitArr(cst.DECL);
        const publicFunctions = this.$visitArr(cst.ANNOTATEDFUNC);

        return {
            symbolTable: this.rootSymbolTable,
            publicFunctions,
            errors: this.errors
        };
    }

    SCRIPT(cst: any) {
        this.$visitArr(cst.DECL);
        const expression = this.visit(cst.EXPR);

        // todo: check expression returns boolean
        return {
            symbolTable: this.rootSymbolTable,
            expression,
            errors: this.errors
        };
    }

    EXPR(cst: any) {
        if ('BINARY_OPERATION' in cst) {
            return this.visit(cst.BINARY_OPERATION);
        }
        return null;
    }

    DECL(cst: any) {
        const decl: (TVaribleDeclaration | TFunctionDeclaration) & WithPosition = this.visit(cst.DECLARATION);
        if ('resultType' in decl) {
            this.currentSymbolTable.addFunction(decl);
        } else {
            this.currentSymbolTable.addVariable(decl);
        }
    }

    FUNC(cst: any, injectedVariables?: (TVaribleDeclaration & WithPosition)[]): TFunctionDeclaration & WithPosition {
        const identifier = this.visit(cst.FUNCTION_NAME);

        this.symbolTableStack.push(new SymbolTable(this.currentSymbolTable));

        // Inject varibles to scope. E.g.: annotated functions
        if (injectedVariables) {
            injectedVariables.forEach(variable =>
                this.currentSymbolTable.addVariable(variable));
        }
        const args = this.$visitArr(cst.FUNCTION_ARG);
        const value = this.visit(cst.FUNCTION_BODY);
        const resultType = this.$DEFINE_TYPE(value);

        this.symbolTableStack.pop();

        return {
            position: extractPosition(identifier),
            name: identifier.image,
            args,
            resultType,
            value
        };
    }

    ANNOTATEDFUNC(cst: any): TFunctionDeclaration & WithPosition {
        let injectVar: TVaribleDeclaration & WithPosition;
        const injectIdentifier = this.visit(cst.IDENTIFIER);
        switch (cst.Annotation[0].image) {
            case '@Callable':
                injectVar = {
                    position: extractPosition(injectIdentifier),
                    name: injectIdentifier.image,
                    type: 'Invocation',
                    value: null
                };
                break;
            case '@Verifier':
                injectVar = {
                    position: injectIdentifier,
                    name: injectIdentifier.image,
                    type: 'Transaction',
                    value: null
                };
                break;
            default:
                return null as any;
        }
        return this.FUNC(cst.FUNC[0].children, [injectVar]);
    }

    FUNCTION_ARG(cst: any): TFunctionArgDeclaration {
        const identifier = this.visit(cst.ARG_NAME);
        const typeIdentifier = this.visit(cst.ARG_TYPE);

        const result = {
            //position: identifier,
            name: identifier.image,
            type: typeIdentifier.ref,
            // value: null
        };
        this.currentSymbolTable.addVariable({
            ...result,
            position: extractPosition(identifier),
            value: null
        });

        return result;
    }

    LET(cst: any): TVaribleDeclaration & WithPosition {
        const identifier = this.visit(cst.VAR_NAME);
        const value = this.visit(cst.VAR_VALUE);
        return {
            position: extractPosition(identifier),
            name: identifier.image,
            value,
            type: this.$DEFINE_TYPE(value)
        };
    }

    BLOCK(cst: any) {
        this.symbolTableStack.push(new SymbolTable(this.currentSymbolTable));
        this.$visitArr(cst.BLOCK_DECLARATIONS);
        const result = this.visit(cst.BLOCK_VALUE);
        this.symbolTableStack.pop();
        return result;
    }

    OR_OP = this.$BINARY_OPERATION;

    AND_OP = this.$BINARY_OPERATION;

    COMPARE_OP = this.$BINARY_OPERATION;

    EQ_OP = this.$BINARY_OPERATION;

    CONS_OP = this.$BINARY_OPERATION;

    ADD_OP = this.$BINARY_OPERATION;

    MUL_OP = this.$BINARY_OPERATION;

    PAR_EXPR(cst: any) {
        return this.visit(cst['EXPR']);
    }

    ATOM_EXPR(cst: any) {
        let result = this.visit(cst.ATOM);

        if ('UnaryOperator' in cst) {
            const op = cst.UnaryOperator[0];
            result = {
                position: extractPosition(op),
                func: op.image === '-' ? 'FUNC_NEG' : op.image,
                args: [result]
            } as TFunctionCall;
        }
        return result;
    }

    GETTABLE_EXPR(cst: any):TAstNode {
        const item = this.visit(cst['ITEM']);
        if ('FUNCTION_CALL' in cst) {
            return this.FUNCTION_CALL(cst.FUNCTION_CALL[0].children, item);
        } else if ('FIELD_ACCESS' in cst) {
            const accessId = this.visit(cst.FIELD_ACCESS);
            const typelessNode = {
                position: extractPosition(accessId),
                item: item,
                fieldAccess: accessId.image,
            };

            return {
                ...typelessNode,
                type: this.$DEFINE_TYPE(typelessNode)
            };
        } else if ('LIST_ACCESS' in cst) {
            return this.LIST_ACCESS(cst.LIST_ACCESS[0].children, item);
        } else return item;

    }

    IF(cst: any) {
        const condition: TAstNode = this.visit(cst.CONDITION_EXPR);
        //todo: check condition returns boolean type
        const thenValue: TAstNode = this.visit(cst.THEN_EXPR);
        const elseValue: TAstNode = this.visit(cst.ELSE_EXPR);
        const type = TypeTable.union(thenValue.type, elseValue.type);

        return {
            position: extractPosition(cst.If[0]),
            condition,
            thenValue,
            elseValue,
            type
        };
    }

    MATCH(cst: any): TMatch {
        const match: Exclude<TAstNode, TLiteral | TListLiteral> = this.visit(cst.MATCH_EXPR);
        // Todo: Check match type to be union
        const cases: TMatchCase[] = this.$visitArr(cst.MATCH_CASE);

        //Todo: Check cases types to cover all match types
        const type = TypeTable.union(...cases.map(x => x.caseValue.type));
        return {
            position: extractPosition(cst.Match[0]),
            match,
            cases,
            type
        };
    }

    MATCH_CASE(cst: any): TMatchCase {
        this.symbolTableStack.push(new SymbolTable(this.currentSymbolTable));

        let caseVar, caseType;
        if (cst.Underscore == null) {
            caseType = this.visit(cst.CASE_TYPE);
            // Todo: check matchType to present in type symbol table
            caseVar = this.visit(cst.CASE_VAR);
            this.currentSymbolTable.addVariable({
                position: extractPosition(caseVar),
                type: caseType.ref,
                name: caseVar.image,
                value: null
            });
        } else {
            caseType = null;
            caseVar = cst.Underscore[0];
        }

        const caseValue: TAstNode = this.visit(cst.CASE_BODY);

        this.symbolTableStack.pop();

        return {
            position: extractPosition(caseVar),
            caseName: caseVar.image,
            caseType,
            caseValue
        };
    }

    FUNCTION_CALL(cst: any, firstArg?: TAstNode): TFunctionCall {
        const funcId = this.visit(cst.FUNCTION_NAME);
        const typelessNode = {
            position: extractPosition(funcId),
            func: funcId.image,
            args: this.$visitArr(cst.FUNCTION_ARGS)
        };

        if (firstArg) typelessNode.args.unshift(firstArg);

        return {
            ...typelessNode,
            type: this.$DEFINE_TYPE(typelessNode)
        };
    }

    LIST_LITERAL(cst: any) {
        const items: TAstNode[] = this.$visitArr(cst.LIST_ITEMS);
        const argsType = TypeTable.union(items.map(x => x.type));
        const typeName = `LIST[${argsType}]`;

        if (this.typeTable.getDefinition(typeName) == null){
            this.typeTable.addDefinition(typeName, {listOf: argsType})
        }

        const listLiteral = {
            position: extractRangePosition(cst.LSquare[0], cst.RSquare[0]),
            items,
            type: `LIST[${argsType}]`,
        };

        if ('LIST_ACCESS' in cst){
            return this.LIST_ACCESS(cst.LIST_ACCESS[0].children, listLiteral as any)
        }else return listLiteral
    }

    LIST_ACCESS(cst: any, node: TAstNode): TListAccess {
        let listAccess;
        let position;
        if (cst.IntegerLiteral) {
            const lit = this.LITERAL(cst);
            listAccess = lit.value;
            position = lit.position;
        } else {
            const ref: TRef = this.visit(cst.REFERENCE);
            //Todo: check reference type to be integer
            position = ref.position;
            listAccess = ref.ref;
        }

        const typelessNode = {
            position,
            listAccess,
            item: node,
        };

        const type = this.$DEFINE_TYPE(typelessNode);
        return {...typelessNode, type};
    }

    LITERAL(cst: any): TLiteral {
        if ('Base64Literal' in cst) {
            return {
                position: extractPosition(cst.Base64Literal[0]),
                type: 'ByteVector',
                value: 'not implemented'//cst.Base64Literal
            };
        } else if ('Base58Literal' in cst) {
            return {
                position: extractPosition(cst.Base58Literal[0]),
                type: 'ByteVector',
                value: 'not implemented'//cst.Base58Literal
            };
        } else if ('IntegerLiteral' in cst) {
            return {
                position: extractPosition(cst.IntegerLiteral[0]),
                type: 'Int',
                value: parseInt(cst.IntegerLiteral[0].image)
            };
        } else if ('StringLiteral' in cst) {
            return {
                position: extractPosition(cst.StringLiteral[0]),
                type: 'String',
                value: cst.StringLiteral[0].image
            };
        } else if ('BooleanLiteral' in cst) {
            return {
                position: extractPosition(cst.BooleanLiteral[0]),
                type: 'Boolean',
                value: cst.BooleanLiteral[0].image === 'true'
            };
        } else if ('LIST_LITERAL' in cst) {
            return this.visit(cst.LIST_LITERAL);
        } else {
            return {
                position: null as any,
                type: 'Unknown',
                value: 'Unknown'
            };
        }
    }

    IDENTIFIER(cst: any) {
        return cst.Identifier[0];
    }

    REFERENCE(cst: any): TRef {
        const typelessNode = {
            position: extractPosition(cst.Identifier[0]),
            ref: cst.Identifier[0].image,
        };

        return {
            ...typelessNode,
            type: this.$DEFINE_TYPE(typelessNode)
        };
    }

    TYPE_REFERENCE(cst: any) {
        // Todo: check type in TypeTable
        return {
            position: extractPosition(cst.Identifier[0]),
            ref: cst.Identifier[0].image as string,
        };
    }
}
