import { rideParser } from './parser';

type TFunction = {
    name: string,
    args: [],
    returns: any
}

type TPrimitive = TBool | TInt

type TStruct = {
    name: string
    fields: { name: string, type: any }[]
}


const Union = (...args: any[]) => {
    if (args.length === 0) return 'Unit';
    else if (args.length === 1) return args[0];
    return args;
};
type TBool = 'Boolean'
type TInt = 'Int'


const FUNC_AND = (...args: any) => ({
    name: 'FUNC_AND',
    args: ['Boolean', args[1].type],
    returns: Union('Boolean', args[1].type)
});

const FUNC_OR = (...args: any) => ({
    name: 'FUNC_OR',
    args: ['Boolean', args[1].type],
    returns: Union('Boolean', args[1].type)
});

const FUNC_EQ = (...args: any) => ({
    name: 'FUNC_EQ',
    args: [args[0].type, args[1].type],
    returns: 'Boolean'
});

const FUNC_GT = ({
    name: 'FUNC_GT',
    args: ['Int', 'Int'],
    returns: 'Boolean'
});
const FUNC_LT = ({
    name: 'FUNC_LT',
    args: ['Int', 'Int'],
    returns: 'Boolean'
});
const FUNC_GTE = ({
    name: 'FUNC_GTE',
    args: ['Int', 'Int'],
    returns: 'Boolean'
});
const FUNC_LTE = ({
    name: 'FUNC_LTE',
    args: ['Int', 'Int'],
    returns: 'Boolean'
});

const FUNC_LOGIC_NEG = ({
    name: 'FUNC_LOGIC_NEG',
    args: ['Boolean'],
    returns: 'Boolean'
});

const FUNC_NEG = ({
    name: 'FUNC_NEG',
    args: ['Int'],
    returns: 'Int'
});

const operatorFunctions: Record<string, any> = {
    '&&': FUNC_AND,
    '||': FUNC_OR,
    '=': FUNC_EQ,
    '>': FUNC_GT,
    '<': FUNC_LT,
    '>=': FUNC_GTE,
    '<=': FUNC_LTE,
    '!': FUNC_LOGIC_NEG,
    '-': FUNC_NEG
};

type TPos = {
    row: number
    col: number
}
type TRange = {
    start: TPos
    end: TPos
}
type TIdentifier = any
type TSymbolTable = {
    parent: TSymbolTable | null
    children: TSymbolTable[]
    values: Record<string, TIdentifier>
}

const RideVisitorConstructor = rideParser.getBaseCstVisitorConstructorWithDefaults();


class RideVisitor extends RideVisitorConstructor {
    rootSymbolTable: TSymbolTable = {
        parent: null,
        children: [],
        values: {}
    };

    currentSymbolTable = this.rootSymbolTable;

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


    EXPR(cst: any) {
        if ('BINARY_OPERATION' in cst){
            return this.visit(cst.BINARY_OPERATION);
        }
        return null
    }

    LET(cst: any) {
        const identifier = cst.LHS[0];
        const value = this.visit(cst.RHS);
        if (this.currentSymbolTable.values[identifier.image]){
            console.error('Duplicate identifier')
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

        if ('UnaryOperator' in cst){
            result = {
                FUNCTION_CALL: operatorFunctions[cst['UnaryOperator'][0].image],
                ARGS: [result]
            }
        }
        return result;
    }

    GETTABLE_EXPR(cst: any) {
        if ('FUNCTION_CALL' in cst){
            cst['FUNCTION_CALL'][0].children.FUNCTION_ARGS.unshift(cst['ITEM'][0])
            return this.visit(cst.FUNCTION_CALL)
        }else {
            const item = this.visit(cst['ITEM']);
            if ('FIELD_ACCESS' in cst){
                return {
                    ITEM: item,
                    FIELD_ACCESS: this.visit(cst.FIELD_ACCESS),
                }
            }
            return item
        }
    }

    FUNCTION_CALL(ctx: any){
        console.log('asd')
    }

    LIST_LITERAL(cst:any){
        console.log('asd')
    }

    LITERAL(ctx: any) {
        if ('Base64Literal' in ctx) {
            return {
                TYPE:'ByteVector',
                LITERAL: ctx.Base64Literal
            };
        } else if ('Base58Literal' in ctx) {
            return {
                TYPE:'ByteVector',
                LITERAL: ctx.Base58Literal
            };
        } else if ('IntegerLiteral' in ctx) {
            return {
                TYPE:'Int',
                LITERAL: ctx.IntegerLiteral
            };
        } else if ('StringLiteral' in ctx) {
            return {
                TYPE:'String',
                LITERAL: ctx.StringLiteral
            };
        } else if ('BooleanLiteral' in ctx) {
            return {
                TYPE:'Boolean',
                LITERAL: ctx.BooleanLiteral
            };
        } else if ('LIST_LITERAL' in ctx) {
            return {
                TYPE:'LIST',
                ITEMS: this.visit(ctx.LIST_LITERAL),
            };
        } else {
            return 'Unknown';
        }
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