import { Parser, IParserConfig } from 'chevrotain';
import {
    allTokens,
    Annotation,
    Assignment,
    Base58Literal,
    Identifier,
    IntegerLiteral,
    LCurly, Let, LPar,
    Operators,
    RCurly, RPar,
    StringLiteral
} from './tokens';

const rideParserOpts: IParserConfig = {
    maxLookahead: 1
};

export class RideParser extends Parser {
    constructor() {
        super(allTokens, rideParserOpts);
        this.performSelfAnalysis();
    }

    public SCRIPT = this.RULE("SCRIPT", () => {
        this.OR([
            //EXPRESSION. На самом деле это не совсем EXPR, так как может быть блоком без скобок^
            {ALT: () => this.SUBRULE(this.BLOCK_BODY)},
            //DAPP
            // {ALT: () => $.SUBRULE($.DAPP)}
        ]);
    });


    public EXPR = this.RULE("EXPR", () => {
        this.OR([
            // {ALT: () => this.SUBRULE(this.LITERAL)},
            // {ALT: () => this.SUBRULE(this.BLOCK)},
            // {ALT: () => this.SUBRULE(this.GETTER)},
            // {ALT: () => this.SUBRULE(this.IF)},
            // {ALT: () => this.SUBRULE(this.MATCH)},
            // {ALT: () => this.SUBRULE(this.MATCH_CASE)},
            // {ALT: () => this.SUBRULE(this.FUNCTION_CALL)},
            // {ALT: () => this.SUBRULE(this.REF)},
            {ALT: () => this.SUBRULE(this.BINARY_OP)},
        ]);
    });

    // public DAPP = this.RULE("DAPP", () => {
    //     this.MANY(() => {
    //         this.SUBRULE(this.DECL);
    //     });
    //     this.AT_LEAST_ONE(() => this.SUBRULE(this.ANNOTATEDFUNC));
    // });


    public BLOCK_BODY = this.RULE("BLOCK_BODY", () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.EXPR)},
            {
                ALT: () => {
                    this.SUBRULE(this.LET);
                    this.SUBRULE(this.BLOCK_BODY);
                }
            }
        ]);
    });

    // public BLOCK = this.RULE("BLOCK", () => {
    //     this.CONSUME(RCurly);
    //     this.SUBRULE(this.BLOCK_BODY);
    //     this.CONSUME(LCurly);
    // });

    public OR_OP = this.RULE("OR_OP", () => {
        this.SUBRULE(this.AND_OP, {LABEL: 'LHS'});
        this.OPTION(() => {
            this.CONSUME(Operators.Or);
            this.SUBRULE1(this.OR_OP, {LABEL: 'RHS'});
        });
    });

    public AND_OP = this.RULE("AND_OP", () => {
        this.SUBRULE(this.COMPARE_OP, {LABEL: 'LHS'});
        this.OPTION(() => {
            this.CONSUME(Operators.And);
            this.SUBRULE1(this.AND_OP, {LABEL: 'RHS'});
        });
    });

    public COMPARE_OP = this.RULE("COMPARE_OP", () => {
        this.SUBRULE(this.EQ_OP, {LABEL: 'LHS'});
        this.OPTION(() => {
            this.CONSUME(Operators.CompareOperator);
            this.SUBRULE1(this.COMPARE_OP, {LABEL: 'RHS'});
        });
    });

    public EQ_OP = this.RULE("EQ_OP", () => {
        this.SUBRULE(this.CONS_OP, {LABEL: 'LHS'});
        this.OPTION(() => {
            this.CONSUME(Operators.EqualityOperator);
            this.SUBRULE1(this.EQ_OP, {LABEL: 'RHS'});
        });
    });

    public CONS_OP = this.RULE("CONS_OP", () => {
        this.SUBRULE(this.ADD_OP, {LABEL: 'LHS'});
        this.OPTION(() => {
            this.CONSUME(Operators.Cons);
            this.SUBRULE1(this.CONS_OP, {LABEL: 'RHS'});
        });
    });

    public ADD_OP = this.RULE("ADD_OP", () => {
        this.SUBRULE(this.MUL_OP, {LABEL: 'LHS'});
        this.OPTION(() => {
            this.CONSUME(Operators.AdditionOperator);
            this.SUBRULE1(this.ADD_OP, {LABEL: 'RHS'});
        });
    });

    public MUL_OP = this.RULE("MUL_OP", () => {
        this.SUBRULE(this.ATOM, {LABEL: 'LHS'});
        this.OPTION(() => {
            this.CONSUME(Operators.MultiplicationOperator);
            this.SUBRULE1(this.MUL_OP, {LABEL: 'RHS'});
        });
    });
// 1 :: 2 :: [3]
    public BINARY_OP = this.RULE("BINARY_OP", () => {
        this.SUBRULE(this.ATOM, {LABEL: 'LHS'});
        this.OPTION(() => {
            this.CONSUME(Operators.BinaryOperator);
            this.SUBRULE1(this.BINARY_OP, {LABEL: 'RHS'});
        });
    });


    public ATOM = this.RULE("ATOM", () => {
        this.OR([
            {
                ALT: () => {
                    this.CONSUME(LPar);
                    this.SUBRULE1(this.BINARY_OP);
                    this.CONSUME(RPar);
                }
            },
            {
                ALT: () => this.SUBRULE(this.LITERAL),
            },
            {
                ALT: () => this.CONSUME(Identifier)
            }
        ]);
    });

    public DECL = this.RULE("DECL", () => {
        this.OR([
            // {ALT: this.SUBRULE(() => this.FUNC)},
            {ALT: this.SUBRULE(() => this.LET)}
        ]);
    });

    public LET = this.RULE("LET", () => {
        this.CONSUME(Let);
        this.CONSUME(Identifier);
        this.CONSUME(Assignment);
        this.SUBRULE(this.EXPR);
    });

    public ANNOTATEDFUNC = this.RULE("ANNOTATEDFUNC", () => {
        this.CONSUME(Annotation);
        // this.SUBRULE(this.FUNC);
    });

    public LITERAL = this.RULE("LITERAL", () => {
        this.OR([
            {ALT: () => this.CONSUME(IntegerLiteral)},
            {ALT: () => this.CONSUME(StringLiteral)},
            {ALT: () => this.CONSUME(Base58Literal)},
        ]);
    });

}