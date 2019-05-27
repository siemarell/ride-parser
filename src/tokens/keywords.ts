import { createToken } from 'chevrotain';

// IDENTIFIER AND KEYWORDS
export const Identifier = createToken({name: "Identifier", pattern: /[a-zA-Z]\w*/});

export const Let = createToken({name: "Let", pattern: /let/, longer_alt: Identifier});
export const If = createToken({name: "If", pattern: /if/, longer_alt: Identifier});
export const Then = createToken({name: "Then", pattern: /then/, longer_alt: Identifier});
export const Else = createToken({name: "Else", pattern: /else/, longer_alt: Identifier});
export const Match = createToken({name: "Match", pattern: /match/, longer_alt: Identifier});
export const Case = createToken({name: "Case", pattern: /case/, longer_alt: Identifier});
export const Func = createToken({name: "Func", pattern: /func/, longer_alt: Identifier});

export const All = [
    Let,
    If,
    Then,
    Else,
    Match,
    Case,
    Func
];