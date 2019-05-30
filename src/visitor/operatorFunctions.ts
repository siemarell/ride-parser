


const Union = (...args: any[]) => {
    if (args.length === 0) return 'Unit';
    else if (args.length === 1) return args[0];
    return args;
};



const FUNC_AND = (...args: any) => ({
    name: `FUNC_AND[${args[1].type}]`,
    args: ['Boolean', args[1].type],
    resultType: Union('Boolean', args[1].type)
});

const FUNC_OR = (...args: any) => ({
    name: `FUNC_OR[${args[1].type}]`,
    args: ['Boolean', args[1].type],
    resultType: Union('Boolean', args[1].type)
});

const FUNC_EQ = (...args: any) => ({
    name: `FUNC_EQ[${args[1].type}]`,
    args: [args[0].type, args[1].type],
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
    '=': FUNC_EQ,
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
    '-': FUNC_NEG,
}