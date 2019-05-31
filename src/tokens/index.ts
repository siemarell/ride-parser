import { createToken, Lexer } from 'chevrotain';
import * as Operators from './operators';
import * as Keywords from './keywords';
import { Identifier } from './keywords';

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

export const Base64Literal = createToken({
    name: "Base64Literal",
    pattern: /base64'[[A-Za-z0-9+/=]+'/
});
export const BooleanLiteral = createToken({name: 'BooleanLiteral', pattern: Lexer.NA});
export const True = createToken({name: "True", pattern: /true/, categories: BooleanLiteral});
export const False = createToken({name: "False", pattern: /false/, categories: BooleanLiteral});

export const Literals = [
    IntegerLiteral,
    StringLiteral,
    Base58Literal,
    Base64Literal,
    BooleanLiteral,
    True,
    False
];

// OTHER
export const Directive = createToken({name: "Directive", pattern: /{-#(.*)#-}/, group: Lexer.SKIPPED});
export const Annotation = createToken({name: "Annotation", pattern: /@(Verifier|Callable)/});


// Symbols
export const Colon = createToken({name: "Colon", label: ":", pattern: /:/, longer_alt: Operators.Cons});
export const SemiColon = createToken({name: "SemiColon", label: ";", pattern: /;/});
export const Comma = createToken({name: "Comma", label: ",", pattern: /,/});
export const Dot = createToken({name: "Dot", label: ".", pattern: /\./});
export const Arrow = createToken({name: "Arrow", label: "=>", pattern: /=>/});
export const Assignment = createToken({name: "Assignment", label: "=", pattern: /=/});
export const Underscore = createToken({name: "Underscore", label: "_", pattern: /_/});

export const Symbols = [
    Colon,
    SemiColon,
    Comma,
    Dot,
    Arrow,
    Assignment,
    Underscore
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
    ...Keywords.All,
    ...Literals,
    Identifier,
    ...Brackets,
    ...Operators.All,
    // BinaryOperator,
    ...Symbols
];

export {
    Operators,
    Keywords,
    Identifier
};