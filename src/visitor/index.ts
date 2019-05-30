import { TFunctionArgument } from '@waves/ride-js';

import { rideParser } from '../parser';
import SymbolTable from './SymbolTable';
import { binaryOperators, unaryOperators } from './operatorFunctions';
import { TFieldAccess, TFunctionCall, TFunctionDeclaration, TVaribleDeclaration } from './types';
import { CstNode } from 'chevrotain';

const RideVisitorConstructor = rideParser.getBaseCstVisitorConstructor();

class RideVisitor extends RideVisitorConstructor {
    rootSymbolTable = new SymbolTable();

    symbolTableStack = [this.rootSymbolTable];

    get currentSymbolTable() {
        return this.symbolTableStack[this.symbolTableStack.length - 1];
    }

    private $BINARY_OPERATION = (cst: any) => {
        const leftResult = this.visit(cst.LHS);
        if (cst.RHS) {
            const rightResult = this.visit(cst.RHS);
            const op = cst.OPERATOR[0];
            let func = binaryOperators[op.image];
            if (typeof func === 'function') {
                func = func(rightResult);
            }
            const res: TFunctionCall = {
                position: op,
                func: func.name,
                args: [leftResult, rightResult]
            };
            return res;
        } else return leftResult;
    };

    constructor() {
        super();
        // This helper will detect any missing or redundant methods on this visitor
        this.validateVisitor();
    }

    // visit(nodes: CstNode | CstNode[], opts?: any){
    //     if (Array.isArray(nodes) && nodes.length > 1){
    //         return nodes.map((node:any) => super.visit(node))
    //     }else {
    //         return super.visit(nodes, opts)
    //     }
    // }

    visitArr(nodes: CstNode[], opts?: any){
        return (nodes || []).map((node:any) => super.visit(node, opts))
    }

    SCRIPT(cst: any) {
        //cst.DECL.forEach((dec:any) => this.visit(dec))
        this.visitArr(cst.DECL);
        const publicFunctions = this.visitArr(cst.ANNOTATEDFUNC);
        const expression = this.visit(cst.EXPR);

        return {
            symbolTable: this.rootSymbolTable,
            expression,
            publicFunctions
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

        const {type, value} = this.visit(cst.FUNCTION_BODY);
        const args = this.visitArr(cst.FUNCTION_ARG);

        this.symbolTableStack.pop();

        return {
            position: identifier,
            name: identifier.image,
            args: args,
            resultType: type,
            value: null
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
            position: identifier,
            value: null
        });

        return result;
    }

    LET(cst: any): TVaribleDeclaration {
        const identifier = this.visit(cst.VAR_NAME);
        const {value, type} = this.visit(cst.VAR_VALUE);
        return {
            position: identifier,
            name: identifier.image,
            value,
            type
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
                position: op,
                func: unaryOperators[op.image].name,
                args: [result]
            } as TFunctionCall;
        }
        return result;
    }

    GETTABLE_EXPR(cst: any) {
        if ('FUNCTION_CALL' in cst) {
            cst['FUNCTION_CALL'][0].children.FUNCTION_ARGS.unshift(cst['ITEM'][0]);
            return this.visit(cst.FUNCTION_CALL);
        } else {
            const item = this.visit(cst['ITEM']);
            if ('FIELD_ACCESS' in cst) {
                const accessId = this.visit(cst.FIELD_ACCESS);
                const res: TFieldAccess = {
                    position: accessId,
                    item: item,
                    fieldAccess: this.visit(cst.FIELD_ACCESS),
                };
                return res;
            }
            return item;
        }
    }

    IF(cst: any){}

    MATCH(cst: any){}

    MATCH_CASE(cst: any){}

    FUNCTION_CALL(cst: any): TFunctionCall {
        const funcId = this.visit(cst.FUNCTION_NAME);
        const args = this.visitArr(cst.FUNCTION_ARGS);
        return {
            position: funcId,
            func: funcId.image,
            args
        };
    }

    LIST_LITERAL(cst: any) {
        console.log('asd');
    }

    LITERAL(ctx: any) {
        if ('Base64Literal' in ctx) {
            return {
                type: 'ByteVector',
                value: ctx.Base64Literal
            };
        } else if ('Base58Literal' in ctx) {
            return {
                type: 'ByteVector',
                value: ctx.Base58Literal
            };
        } else if ('IntegerLiteral' in ctx) {
            return {
                type: 'Int',
                value: ctx.IntegerLiteral
            };
        } else if ('StringLiteral' in ctx) {
            return {
                type: 'String',
                value: ctx.StringLiteral
            };
        } else if ('BooleanLiteral' in ctx) {
            return {
                type: 'Boolean',
                value: ctx.BooleanLiteral
            };
        } else if ('LIST_LITERAL' in ctx) {
            const val = this.visit(ctx.LIST_LITERAL);
            return {
                type: 'LIST',
                value: val
            };
        } else {
            return 'Unknown';
        }
    }

    IDENTIFIER(cst: any) {
        return cst.Identifier[0];
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