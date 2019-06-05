import { TypeTable, TTypeRef} from './TypeTable';

const FUNC_AND = (...types: TTypeRef[]) => ({
    name: `FUNC_AND[${types[1]}]`,
    args: ['Boolean', types[1]],
    resultType:TypeTable.union('Boolean', types[1])
});

const FUNC_OR = (...types: TTypeRef[]) => ({
    name: `FUNC_OR[${types[1]}]`,
    args: ['Boolean', types[1]],
    resultType:TypeTable.union('Boolean', types[1])
});

const FUNC_EQ = (...types: TTypeRef[]) => ({
    name: `FUNC_EQ[${types[0]}]`,
    args: [types[0], types[0]],
    resultType: 'Boolean'
});

const FUNC_GT = ({
    name: 'FUNC_GT',
    args: ['Int', 'Int'],
    resultType: 'Boolean'
});
const FUNC_LT = ({
    name: 'FUNC_LT',
    args: ['Int', 'Int'],
    resultType: 'Boolean'
});
const FUNC_GTE = ({
    name: 'FUNC_GTE',
    args: ['Int', 'Int'],
    returns: 'Boolean'
});
const FUNC_LTE = ({
    name: 'FUNC_LTE',
    args: ['Int', 'Int'],
    resultType: 'Boolean'
});

const FUNC_LOGIC_NEG = ({
    name: 'FUNC_LOGIC_NEG',
    args: ['Boolean'],
    resultType: 'Boolean'
});

const FUNC_NEG = ({
    name: 'FUNC_NEG',
    args: ['Int'],
    resultType: 'Int'
});


const FUNC_MUL = ({
    name: 'FUNC_MUL',
    args: ['Int', 'INT'],
    resultType: 'Int'
});


const FUNC_DIV = ({
    name: 'FUNC_DIV',
    args: ['Int', 'INT'],
    resultType: 'Int'
});

const FUNC_ADD = ({
    name: 'FUNC_ADD',
    args: ['Int', 'INT'],
    resultType: 'Int'
});
const FUNC_SUB = ({
    name: 'FUNC_SUB',
    args: ['Int', 'INT'],
    resultType: 'Int'
});
const FUNC_MOD = ({
    name: 'FUNC_MOD',
    args: ['Int', 'INT'],
    resultType: 'Int'
});

export const binaryOperators: Record<string, any> = {
    '&&': FUNC_AND,
    '||': FUNC_OR,
    '==': FUNC_EQ,
    '>': FUNC_GT,
    '<': FUNC_LT,
    '>=': FUNC_GTE,
    '<=': FUNC_LTE,
    '*': FUNC_MUL,
    '/': FUNC_DIV,
    '+': FUNC_ADD,
    '-': FUNC_SUB,
    '%': FUNC_MOD
};

export const unaryOperators: Record<string, any> = {
    '!': FUNC_LOGIC_NEG,
    // Use 'NEG' key to remove ambiguity with FUNC_SUB. Key is replaced in visitor
    'FUNC_NEG': FUNC_NEG,
}