import { rideParser } from '../parser';
import SymbolTable from './SymbolTable';
import { operatorFunctions } from './operatorFunctions';

const RideVisitorConstructor = rideParser.getBaseCstVisitorConstructor();

class RideVisitor extends RideVisitorConstructor {
    rootSymbolTable = new SymbolTable();

    symbolTableStack = [this.rootSymbolTable];

    get currentSymbolTable(){
        return this.symbolTableStack[this.symbolTableStack.length -1]
    }

    private $BINARY_OPERATION = (cst: any) => {
        const leftResult = this.visit(cst.LHS);
        if (cst.RHS) {
            const rightResult = this.visit(cst.RHS);
            let func = operatorFunctions[cst.OPERATOR[0].image];
            if (typeof func === 'function') {
                func = func(rightResult);
            }
            return {
                FUNCTION_CALL: func,
                ARGS: [leftResult, rightResult]
            };
        } else return leftResult;
    };

    constructor() {
        super();
        // This helper will detect any missing or redundant methods on this visitor
        this.validateVisitor();
    }

    SCRIPT(cst: any) {
        this.visit(cst.DECL);
        const publicFunctions = this.visit(cst.ANNOTATEDFUNC);
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
        this.currentSymbolTable.addDeclaration(decl)
        if (this.currentSymbolTable.values[decl.name]) {
            console.error('Duplicate identifier');
        }
        this.currentSymbolTable.values[decl.name] = decl;
    }

    FUNC(cst: any, injectedVariables: any[]) {
        const identifier = this.visit(cst.FUNCTION_NAME);

        this.symbolTableStack.push(new SymbolTable(this.currentSymbolTable));

        if (injectedVariables){
            injectedVariables.forEach(variable =>
                this.currentSymbolTable.addDeclaration(variable))
        }

        const body = this.visit(cst.FUNCTION_BODY);
        const args = this.visit(cst.FUNCTION_ARG);

        this.symbolTableStack.pop();

        return {
            name: identifier.image,
            identifier,
            body,
            args
        };
    }

    ANNOTATEDFUNC(cst: any) {
        let inectVar;
        switch (cst.Annotation[0].image) {
            case '@Callable':

        }
        const annName = cst.Annotation[0].image


    }

    LET(cst: any) {
        const identifier = this.visit(cst.VAR_NAME);
        const value = this.visit(cst.VAR_VALUE);
        if (this.currentSymbolTable.values[identifier.image]) {
            console.error('Duplicate identifier');
        }
        this.currentSymbolTable.values[identifier.image] = {
            identifier,
            value
        };
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
            result = {
                FUNCTION_CALL: operatorFunctions[cst['UnaryOperator'][0].image],
                ARGS: [result]
            };
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
                return {
                    ITEM: item,
                    FIELD_ACCESS: this.visit(cst.FIELD_ACCESS),
                };
            }
            return item;
        }
    }

    FUNCTION_CALL(ctx: any) {
        console.log('asd');
    }

    LIST_LITERAL(cst: any) {
        console.log('asd');
    }

    LITERAL(ctx: any) {
        if ('Base64Literal' in ctx) {
            return {
                TYPE: 'ByteVector',
                LITERAL: ctx.Base64Literal
            };
        } else if ('Base58Literal' in ctx) {
            return {
                TYPE: 'ByteVector',
                LITERAL: ctx.Base58Literal
            };
        } else if ('IntegerLiteral' in ctx) {
            return {
                TYPE: 'Int',
                LITERAL: ctx.IntegerLiteral
            };
        } else if ('StringLiteral' in ctx) {
            return {
                TYPE: 'String',
                LITERAL: ctx.StringLiteral
            };
        } else if ('BooleanLiteral' in ctx) {
            return {
                TYPE: 'Boolean',
                LITERAL: ctx.BooleanLiteral
            };
        } else if ('LIST_LITERAL' in ctx) {
            return {
                TYPE: 'LIST',
                ITEMS: this.visit(ctx.LIST_LITERAL),
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