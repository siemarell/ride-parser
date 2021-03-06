// OPERATORS

import { createToken, Lexer } from 'chevrotain';

export const BinaryOperator = createToken({name: 'BinaryOperator', pattern: Lexer.NA});
export const UnaryOperator = createToken({name: 'UnaryOperator', pattern: Lexer.NA});

// export const BooleanOperator = createToken({name: 'BooleanOperator', pattern: Lexer.NA});
export const Or = createToken({name: "Or", label: "||", pattern: /\|\|/, categories: BinaryOperator});
export const And = createToken({name: "And", label: "&&", pattern: /&&/, categories: BinaryOperator});

export const CompareOperator = createToken({name: 'CompareOperator', pattern: Lexer.NA});
export const GTE = createToken({name: "GTE", label: ">=", pattern: />=/, categories: [BinaryOperator, CompareOperator]});
export const LTE = createToken({name: "LTE", label: "<=", pattern: /<=/, categories: [BinaryOperator, CompareOperator]});
export const GT = createToken({name: "GT", label: ">", pattern: />/, categories: [BinaryOperator, CompareOperator]});
export const LT = createToken({name: "LT", label: "<", pattern: /</, categories: [BinaryOperator, CompareOperator]});

export const EqualityOperator = createToken({name: 'EqualityOperator', pattern: Lexer.NA});
export const Equals = createToken({name: "Equals", label: "==", pattern: /==/, categories: [BinaryOperator, EqualityOperator]});
export const NotEquals = createToken({name: "NotEquals", label: "!=", pattern: /!=/, categories: [BinaryOperator, EqualityOperator]});

export const Cons = createToken({name: "Cons", label: "::", pattern: /::/, categories: BinaryOperator});

export const AdditionOperator = createToken({name: "AdditionOperator", pattern: Lexer.NA});
export const Sum = createToken({name: "Sum", label: "+", pattern: /\+/, categories: [BinaryOperator, AdditionOperator]});
export const Minus = createToken({name: "Minus", label: "-", pattern: /-/, categories: [BinaryOperator, AdditionOperator, UnaryOperator]});

export const MultiplicationOperator = createToken({name: "MultiplicationOperator", pattern: Lexer.NA});
export const Div = createToken({name: "Div", label: "/", pattern: /\//, categories: [BinaryOperator, MultiplicationOperator]});
export const Mul = createToken({name: "Mul", label: "*", pattern: /\*/, categories: [BinaryOperator, MultiplicationOperator]});
export const Mod = createToken({name: "Mod", label: "%", pattern: /%/, categories: [BinaryOperator, MultiplicationOperator]});

export const Neg = createToken({name: "Neg", label: "!", pattern: /!/, longer_alt: NotEquals, categories: UnaryOperator});

export const All = [
    BinaryOperator,
    UnaryOperator,
    Or,
    And,
    CompareOperator,
    GTE,
    LTE,
    GT,
    LT,
    EqualityOperator,
    Equals,
    NotEquals,
    Cons,
    AdditionOperator,
    Sum,
    Minus,
    MultiplicationOperator,
    Mul,
    Div,
    Mod,
    Neg,
];
