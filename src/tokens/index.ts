import { createToken, Lexer } from 'chevrotain';

// IDENTIFIER AND KEYWORDS
const Identifier = createToken({name: "Identifier", pattern: /[a-zA-Z]\w*/});
const Let = createToken({name: "Let", pattern: /let/, group: "keywords", longer_alt: Identifier});
const IfElse = createToken({name: "IfElse", pattern: /ifelse/, group: "keywords", longer_alt: Identifier});
const If = createToken({name: "If", pattern: /if/, group: "keywords", longer_alt: Identifier});
const Else = createToken({name: "Else", pattern: /else/, group: "keywords", longer_alt: Identifier});
const Match = createToken({name: "Match", pattern: /match/, group: "keywords", longer_alt: Identifier});
const Case = createToken({name: "Case", pattern: /case/, group: "keywords", longer_alt: Identifier});
const Func = createToken({name: "Func", pattern: /func/, group: "keywords", longer_alt: Identifier});

const Keywords = [
    Let,
    IfElse,
    If,
    Else,
    Match,
    Case,
    Func
];

// BRACERS
const LPar = createToken({name: "LPar", label: "(", pattern: /true/});
const RPar = createToken({name: "RPar", label: ")", pattern: /false/});
const LCurly = createToken({name: "LCurly", label: "{", pattern: /true/});
const RCurly = createToken({name: "RCurly", label: "}", pattern: /false/});
const LSquare = createToken({name: "LSquare", label: "}", pattern: /false/});
const RSquare = createToken({name: "RSquare", label: "}", pattern: /false/});

const Brackets = [
    LPar,
    RPar,
    LCurly,
    RCurly,
    LSquare,
    RSquare
];

// BOOLEANS
const True = createToken({name: "True", pattern: /true/});
const False = createToken({name: "False", pattern: /false/});
const Booleans = [True, False];

// LITERALS
const IntegerLiteral = createToken({name: "IntegerLiteral", pattern: /0|[1-9]\d*/});
const Base58Literal = createToken({
    name: "Base58Literal",
    pattern: /base58'[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+'/
});

const Literals = [
    IntegerLiteral,
    Base58Literal
];

// OTHER
const Directive = createToken({name: "Directive", pattern: /{-#(.*)#-}/});
const Annotation = createToken({name: "Annotation", pattern: /@(Verifier|Callable)/});
const Colon = createToken({name: "Colon", label: ":", pattern: /:/});
const Comma = createToken({name: "Comma", label: ",", pattern: /,/});
const Arrow = createToken({name: "Arrow", label: "=>", pattern: /=>/});
const Assignment = createToken({name: "Assignment", label: "=", pattern: /=/});


// BOOLEAN OPERATORS
const GTE = createToken({name: "GTE", label: ">=", pattern: />=/});
const LTE = createToken({name: "LTE", label: "<=", pattern: /<=/});
const GT = createToken({name: "GT", label: ">", pattern: />/});
const LT = createToken({name: "LT", label: "<", pattern: /</});
const And = createToken({name: "And", label: "&&", pattern: /&&/});
const Or = createToken({name: "Or", label: "||", pattern: /\|\|/});
const Equals = createToken({name: "Equals", label: "==", pattern: /==/});

const BooleanOperators = [
    GTE,
    LTE,
    GT,
    LT,
    And,
    Or,
    Equals
];

// SKIP
const Commentary = createToken({
    name: "Commentary",
    pattern: /#.*\n/,
    group: Lexer.SKIPPED
});
const WhiteSpace = createToken({
    name: "WhiteSpace",
    pattern: /\s+/,
    group: Lexer.SKIPPED
});

export const allTokens = [
    WhiteSpace,
    Commentary,
    ...Brackets,
    Directive,
    Annotation,
    ...Keywords,
    ...Booleans,
    ...BooleanOperators,
    Identifier,
    ...Literals,
    Colon,
    Comma,
    Arrow,
    Assignment
];
