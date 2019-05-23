import { createToken, Lexer } from 'chevrotain';
import * as Operators from './operators'
// IDENTIFIER AND KEYWORDS
export const Identifier = createToken({name: "Identifier", pattern: /[a-zA-Z]\w*/});
export const Let = createToken({name: "Let", pattern: /let/, group: "keywords", longer_alt: Identifier});
export const IfElse = createToken({name: "IfElse", pattern: /ifelse/, group: "keywords", longer_alt: Identifier});
export const If = createToken({name: "If", pattern: /if/, group: "keywords", longer_alt: Identifier});
export const Else = createToken({name: "Else", pattern: /else/, group: "keywords", longer_alt: Identifier});
export const Match = createToken({name: "Match", pattern: /match/, group: "keywords", longer_alt: Identifier});
export const Case = createToken({name: "Case", pattern: /case/, group: "keywords", longer_alt: Identifier});
export const Func = createToken({name: "Func", pattern: /func/, group: "keywords", longer_alt: Identifier});

export const Keywords = [
    Let,
    IfElse,
    If,
    Else,
    Match,
    Case,
    Func
];

// BRACERS
export const LPar = createToken({name: "LPar", label: "(", pattern: /\(/});
export const RPar = createToken({name: "RPar", label: ")", pattern: /\)/});
export const LCurly = createToken({name: "LCurly", label: "{", pattern: /{/});
export const RCurly = createToken({name: "RCurly", label: "}", pattern: /}/});
export const LSquare = createToken({name: "LSquare", label: "[", pattern: /\[/});
export const RSquare = createToken({name: "RSquare", label: "]", pattern: /\]/});

export const Brackets = [
    LPar,
    RPar,
    LCurly,
    RCurly,
    LSquare,
    RSquare
];

// LITERALS
export const IntegerLiteral = createToken({name: "IntegerLiteral", pattern: /0|[1-9]\d*/});
export const StringLiteral = createToken({name: "StringLiteral", pattern: /"[a-zA-Z0-9]*"/});
export const Base58Literal = createToken({
    name: "Base58Literal",
    pattern: /base58'[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+'/
});
export const True = createToken({name: "True", pattern: /true/});
export const False = createToken({name: "False", pattern: /false/});

export const Literals = [
    IntegerLiteral,
    StringLiteral,
    Base58Literal,
    True,
    False
];

// OTHER
export const Directive = createToken({name: "Directive", pattern: /{-#(.*)#-}/});
export const Annotation = createToken({name: "Annotation", pattern: /@(Verifier|Callable)/});


// Symbols
export const Colon = createToken({name: "Colon", label: ":", pattern: /:/});
export const Comma = createToken({name: "Comma", label: ",", pattern: /,/});
export const Dot = createToken({name: "Dot", label: ".", pattern: /\./});
export const Arrow = createToken({name: "Arrow", label: "=>", pattern: /=>/});
export const Assignment = createToken({name: "Assignment", label: "=", pattern: /=/});

export const Symbols = [
    Colon,
    Comma,
    Dot,
    Arrow,
    Assignment
];


// SKIP
export const Commentary = createToken({
    name: "Commentary",
    pattern: /#.*\n/,
    group: Lexer.SKIPPED
});
export const WhiteSpace = createToken({
    name: "WhiteSpace",
    pattern: /\s+/,
    group: Lexer.SKIPPED
});

export const allTokens = [
    WhiteSpace,
    Commentary,
    Directive,
    Annotation,
    ...Literals,
    ...Brackets,
    ...Keywords,
    ...Operators.All,
    // BinaryOperator,
    Identifier,
    ...Symbols
];

export {
    Operators
}