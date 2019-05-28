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

const operatorFunctions: Record<string, any> = {
    '&&': FUNC_AND,
    '||': FUNC_OR,
    '=': FUNC_EQ,
    '>': FUNC_GT,
    '<': FUNC_LT,
    '>=': FUNC_GTE,
    '<=': FUNC_LTE
};

type TPos = {
    row: number
    col: number
}
type TRange = {
    start: TPos
    end: TPos
}
type TIdentifier = {
    name: string
    type: string
    pos: TRange
}
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

    private BINARY_OPERATION = (cst: any) => {
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
        return this.visit(cst.BINARY_OPERATION);
    }

    OR_OP = this.BINARY_OPERATION;

    AND_OP = this.BINARY_OPERATION;

    COMPARE_OP = this.BINARY_OPERATION;

    EQ_OP = this.BINARY_OPERATION;

    CONS_OP = this.BINARY_OPERATION;

    ADD_OP = this.BINARY_OPERATION;

    MUL_OP = this.BINARY_OPERATION;

    ATOM_EXPR(cst: any) {
        return this.visit(cst);
    }

    PAR_EXPR(cst: any) {
        return this.visit(cst);
    }

    GETTABLE_EXPR(cst: any) {
        return this.visit(cst);
    }

    LET(cst: any) {
        const lhs = cst.LHS[0];
        const rhs = cst.RHS[0];
        const identifier = lhs;
        console.log(this.visit(rhs));
        identifier.type = this.visit(rhs);
        this.currentSymbolTable.values[identifier.image] = identifier;
    }

    LITERAL(ctx: any) {
        if ('Base64Literal' in ctx) {
            return 'ByteVector';
        } else if ('Base58Literal' in ctx) {
            return 'ByteVector';
        } else if ('IntegerLiteral' in ctx) {
            return 'Int';
        } else if ('StringLiteral' in ctx) {
            return 'String';
        } else if ('BooleanLiteral' in ctx) {
            return 'Boolean';
        } else if ('LIST_LITERAL' in ctx) {
            return 'List[T]';
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