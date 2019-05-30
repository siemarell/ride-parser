


const Union = (...args: any[]) => {
    if (args.length === 0) return 'Unit';
    else if (args.length === 1) return args[0];
    return args;
};



const FUNC_AND = (...args: any) => ({
    name: 'FUNC_AND',
    args: ['Boolean', args[1].type],
    resultType: Union('Boolean', args[1].type)
});

const FUNC_OR = (...args: any) => ({
    name: 'FUNC_OR',
    args: ['Boolean', args[1].type],
    resultType: Union('Boolean', args[1].type)
});

const FUNC_EQ = (...args: any) => ({
    name: 'FUNC_EQ',
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





export const operatorFunctions: Record<string, any> = {
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