import { TFunctionArgument, TType } from '@waves/ride-js';

import { rideParser } from '../parser';
import SymbolTable from './SymbolTable';
import { binaryOperators, unaryOperators, Union } from './operatorFunctions';
import {
    TAstNode,
    TError,
    TFieldAccess, TFunctionArgDeclaration,
    TFunctionCall,
    TFunctionDeclaration,
    TLiteral, TMatch, TMatchCase,
    TRef,
    TVaribleDeclaration
} from './types';
import { CstNode } from 'chevrotain';

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

class RideVisitor extends RideVisitorConstructor {
    rootSymbolTable = new SymbolTable();

    symbolTableStack = [this.rootSymbolTable];

    errors: TError[] = [];

    get currentSymbolTable() {
        return this.symbolTableStack[this.symbolTableStack.length - 1];
    }

    private $CHECK_ARGUMENTS(declaredArgs: TFunctionArgDeclaration[], actualArgs: TAstNode[]) {

    }

    private $DEFINE_TYPE(typelessNode:
                             Omit<TFunctionCall, "type"> |
                             Omit<TFieldAccess, "type"> |
                             Omit<TRef, "type"> |
                             Omit<TMatch, "type"> |
                             TLiteral
    ): TType {
        if ('func' in typelessNode) {
            let decl = this.currentSymbolTable.getDeclarationByName(typelessNode.func) as TFunctionDeclaration | null;
            if (decl == null) {
                const {position} = typelessNode;
                this.errors.push({
                    position,
                    message: `Unresolved identifier '${typelessNode.func}`
                });
                return 'Unknown';
            } else {
                if (typeof decl === 'function')
                    decl = decl(...typelessNode.args.map(arg => arg && arg.type));
                this.$CHECK_ARGUMENTS(decl.args, typelessNode.args);
                return decl.resultType;
            }
        }
        else if ('ref' in typelessNode) {
            const decl = this.currentSymbolTable.getDeclarationByName(typelessNode.ref) as TVaribleDeclaration | null;
            if (decl == null) {
                const {position} = typelessNode;
                this.errors.push({
                    position,
                    message: `Unresolved identifier '${typelessNode.ref}`
                });
                return 'Unknown';
            } else {
                return decl.type;
            }
        }
        else if ('fieldAccess' in typelessNode) {
            return 'DefineType not implemented for FIELD_ACCESS';
        } else if ('match' in typelessNode) {
            return 'DefineType not implemented for MATCH';
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

    constructor() {
        super();
        // This helper will detect any missing or redundant methods on this visitor
        this.validateVisitor();
    }


    visitArr(nodes: CstNode[], opts?: any) {
        return (nodes || []).map((node: any) => super.visit(node, opts));
    }

    DAPP(cst: any) {
        this.visitArr(cst.DECL);
        const publicFunctions = this.visitArr(cst.ANNOTATEDFUNC);

        return {
            symbolTable: this.rootSymbolTable,
            publicFunctions,
            errors: this.errors
        };
    }

    SCRIPT(cst: any) {
        this.visitArr(cst.DECL);
        const expression = this.visit(cst.EXPR);

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
        const decl = this.visit(cst.DECLARATION);
        this.currentSymbolTable.addDeclaration(decl);
    }

    FUNC(cst: any, injectedVariables?: TVaribleDeclaration[]): TFunctionDeclaration {
        const identifier = this.visit(cst.FUNCTION_NAME);

        this.symbolTableStack.push(new SymbolTable(this.currentSymbolTable));

        // Inject varibles to scope. E.g.: annotated functions
        if (injectedVariables) {
            injectedVariables.forEach(variable =>
                this.currentSymbolTable.addDeclaration(variable));
        }
        const args = this.visitArr(cst.FUNCTION_ARG);
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

    ANNOTATEDFUNC(cst: any): TFunctionDeclaration {
        let injectVar: TVaribleDeclaration;
        const injectIdentifier = this.visit(cst.IDENTIFIER);
        switch (cst.Annotation[0].image) {
            case '@Callable':
                injectVar = {
                    position: injectIdentifier,
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
        return this.FUNC(cst.FUNC[0], [injectVar]);
    }

    FUNCTION_ARG(cst: any): TFunctionArgument {
        const identifier = this.visit(cst.ARG_NAME);
        const typeIdentifier = this.visit(cst.ARG_TYPE);

        const result = {
            //position: identifier,
            doc: '',
            name: identifier.image,
            type: typeIdentifier.image,
            // value: null
        };
        this.currentSymbolTable.addDeclaration({
            ...result,
            position: extractPosition(identifier),
            value: null
        });

        return result;
    }

    LET(cst: any): TVaribleDeclaration {
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
        this.visitArr(cst.BLOCK_DECLARATIONS);
        this.symbolTableStack.pop();
        return this.visit(cst.BLOCK_VALUE);
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

    GETTABLE_EXPR(cst: any): TFunctionCall | TFieldAccess {
        if ('FUNCTION_CALL' in cst) {
            cst['FUNCTION_CALL'][0].children.FUNCTION_ARGS.unshift(cst['ITEM'][0]);
            return this.visit(cst.FUNCTION_CALL);
        } else {
            const item = this.visit(cst['ITEM']);
            if ('FIELD_ACCESS' in cst) {
                const accessId = this.visit(cst.FIELD_ACCESS);
                const typelessNode = {
                    position: extractPosition(accessId),
                    item: item,
                    fieldAccess: this.visit(cst.FIELD_ACCESS),
                };

                return {
                    ...typelessNode,
                    type: this.$DEFINE_TYPE(typelessNode)
                };
            }
            return item;
        }
    }

    IF(cst: any) {

    }

    MATCH(cst: any): TMatch {
        const match: Exclude<TAstNode, TLiteral> = this.visit(cst.MATCH_EXPR);
        // Todo: Check match type to be union
        const cases: TMatchCase[] = this.visitArr(cst.MATCH_CASE);

        //Todo: Check cases types to cover all match types
        const type = Union(...cases.map(x => x.caseValue.type));
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
        if (cst.Underscore == null){
            caseType = this.visit(cst.CASE_TYPE);
            // Todo: check matchType to present in type symbol table
            caseVar =  this.visit(cst.CASE_VAR);
            this.currentSymbolTable.addDeclaration({
                position: extractPosition(caseVar),
                type: caseType.image,
                name: caseVar.image,
                value: null
            })
        }else {
            caseType = null
            caseVar = cst.Underscore[0]
        }

        const caseValue: TAstNode = this.visit(cst.CASE_BODY);

        this.symbolTableStack.pop();

        return {
            position: extractPosition(caseVar),
            caseName: caseVar.image,
            caseType,
            caseValue
        }
    }

    FUNCTION_CALL(cst: any): TFunctionCall {
        const funcId = this.visit(cst.FUNCTION_NAME);
        const typelessNode = {
            position: extractPosition(funcId),
            func: funcId.image,
            args: this.visitArr(cst.FUNCTION_ARGS)
        };
        return {
            ...typelessNode,
            type: this.$DEFINE_TYPE(typelessNode)
        };
    }

    LIST_LITERAL(cst: any) {
        console.log('asd');
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
            const val = this.visit(cst.LIST_LITERAL);
            return {
                position: extractPosition(cst.LIST_LITERAL[0]),
                type: 'LIST',
                value: val
            };
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
}

// We only need a single interpreter instance because our interpreter has no state.
export const rideVisitor = new RideVisitor();

// module.exports = function(text) {
//     // 1. Tokenize the input.
//     const lexResult = CalculatorLexer.tokenize(text)
//
//     // 2. Parse the Tokens vector.
//     parser.input = lexResult.tokens
//     const cst = parser.expression()
//
//     // 3. Perform semantics using a CstVisitor.
//     // Note that separation of concerns between the syntactic analysis (parsing) and the semantics.
//     const value = interpreter.visit(cst)
//
//     return {
//         value: value,
//         lexResult: lexResult,
//         parseErrors: parser.errors
//     }
// }