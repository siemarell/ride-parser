const ch = require('chevrotain');
const fs = require('fs');


//const Keyword = ch.createToken({name: "Keyword", pattern: /let|if|then|else|ifelse|match|case|base64|base58|func/});

const Identifier = ch.createToken({name: "Identifier", pattern: /[a-zA-Z]\w*/});
const Let = ch.createToken({name: "Let", pattern: /let/, group: "keywords", longer_alt: Identifier});
const IfElse = ch.createToken({name: "IfElse", pattern: /ifelse/, group: "keywords", longer_alt: Identifier});
const If = ch.createToken({name: "If", pattern: /if/, group: "keywords", longer_alt: Identifier});
const Else = ch.createToken({name: "Else", pattern: /else/, group: "keywords", longer_alt: Identifier});
const Match = ch.createToken({name: "Match", pattern: /match/, group: "keywords", longer_alt: Identifier});
const Case = ch.createToken({name: "Case", pattern: /case/, group: "keywords", longer_alt: Identifier});
const Func = ch.createToken({name: "Func", pattern: /func/, group: "keywords", longer_alt: Identifier});

const Keywords = [
    Let,
    IfElse,
    If,
    Else,
    Match,
    Case,
    Func
];

const True = ch.createToken({name: "True", pattern: /true/});
const False = ch.createToken({name: "False", pattern: /false/});
const Booleans = [True, False];

const IntegerLiteral = ch.createToken({name: "IntegerLiteral", pattern: /0|[1-9]\d*/});
const Base58Literal = ch.createToken({name: "Base58Literal", pattern: /0|[1-9]\d*/});
const Directive = ch.createToken({name: "Directive", pattern: /{-#(.*)#-}/})
const Annotation = ch.createToken({name: "Annotation", pattern: /@(Verifier|Callable)/})

const Comma = ch.createToken({name: "Comma", pattern: /,/})
const Assigment = ch.createToken({name: "Assigment", pattern: /=/})
const GTE = ch.createToken({name: "GreaterThanOrEqual", pattern: />=/, group: "booleanOperators"})
const LTE = ch.createToken({name: "LessThanOrEqual", pattern: /<=/, group: "booleanOperators"})
const GT = ch.createToken({name: "GreaterThan", pattern: />/, group: "booleanOperators"})
const LT = ch.createToken({name: "LessThan", pattern: /</, group: "booleanOperators"})
const And = ch.createToken({name: "And", pattern: /&&/, group: "booleanOperators"})
const Or = ch.createToken({name: "Or", pattern: /\|\|/, group: "booleanOperators"})
const Equals = ch.createToken({name: "Equals", pattern: /==/, group: "booleanOperators"})

const BooleanOperators = [
    GTE,
    LTE,
    GT,
    LT,
    And,
    Or,
    Equals
]

const Commentary = ch.createToken({
    name: "Commentary",
    pattern: /#.*\n/,
    group: ch.Lexer.SKIPPED
})
const WhiteSpace = ch.createToken({
    name: "WhiteSpace",
    pattern: /\s+/,
    group: ch.Lexer.SKIPPED
})

const AllTokens =[
    WhiteSpace,
    Commentary,
    Directive,
    Annotation,
    ...Keywords,
    ...Booleans,
    ...BooleanOperators,
    Identifier,
    IntegerLiteral,
    Comma,
    Assigment
]
const lexer = new ch.Lexer()

const text = fs.readFileSync('ride.ride', {encoding: 'utf-8'});
let lexingResult = lexer.tokenize(text);



console.dir(lexingResult, {depth: null})