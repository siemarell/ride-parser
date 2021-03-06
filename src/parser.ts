import { Parser, IParserConfig, IToken } from 'chevrotain';
import {
    allTokens,
    Annotation, Arrow,
    Assignment,
    Base58Literal, Base64Literal, Colon, Comma, Dot, False,
    Identifier,
    IntegerLiteral, Keywords,
    LCurly, LPar, LSquare,
    Operators,
    RCurly, RPar, RSquare,
    StringLiteral, BooleanLiteral, Underscore
} from './tokens';

const rideParserOpts: IParserConfig = {
    maxLookahead: 2,
    //recoveryEnabled: true
};

class RideParser extends Parser {
    constructor() {
        super(allTokens, rideParserOpts);
        this.performSelfAnalysis();
    }

    public DAPP = this.RULE("DAPP", () => {
        this.MANY(() => this.SUBRULE(this.DECL));
        this.AT_LEAST_ONE(() => this.SUBRULE(this.ANNOTATEDFUNC));
    });

    public SCRIPT = this.RULE("SCRIPT", () => {
        // this.OR([
        //     {ALT: () => {
        //         this.AT_LEAST_ONE(() => this.SUBRULE(this.DECL))
        //             this.SUBRULE(this.EXPR)
        //         }},
        //     {ALT: () => this.SUBRULE1(this.EXPR)}
        // ])
        // this.SUBRULE(this.DECL)
        this.MANY(() => this.SUBRULE(this.DECL));
        this.SUBRULE(this.EXPR);
    });

    public EXPR = this.RULE("EXPR", () => {
        this.SUBRULE(this.OR_OP, {LABEL: 'BINARY_OPERATION'});
    });

    public DECL = this.RULE("DECL", () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.FUNC, {LABEL: 'DECLARATION'})},
            {ALT: () => this.SUBRULE(this.LET, {LABEL: 'DECLARATION'})}
        ]);
    });

    public FUNC = this.RULE("FUNC", () => {
        this.CONSUME(Keywords.Func);
        this.SUBRULE(this.IDENTIFIER, {LABEL: 'FUNCTION_NAME'});
        this.CONSUME(LPar);
        this.MANY_SEP({SEP: Comma, DEF: () => this.SUBRULE(this.FUNCTION_ARG)});
        this.CONSUME(RPar);
        this.CONSUME(Assignment);
        this.SUBRULE(this.EXPR, {LABEL: 'FUNCTION_BODY'});
    });

    public ANNOTATEDFUNC = this.RULE("ANNOTATEDFUNC", () => {
        this.CONSUME(Annotation);
        this.CONSUME(LPar);
        this.SUBRULE(this.IDENTIFIER);
        this.CONSUME(RPar);
        this.SUBRULE(this.FUNC);
    });

    public FUNCTION_ARG = this.RULE("FUNCTION_ARG", () => {
        this.SUBRULE(this.IDENTIFIER, {LABEL: 'ARG_NAME'});
        this.CONSUME(Colon);
        this.SUBRULE1(this.TYPE_REFERENCE, {LABEL: 'ARG_TYPE'});
    });

    public LET = this.RULE("LET", () => {
        this.CONSUME(Keywords.Let);
        this.SUBRULE(this.IDENTIFIER, {LABEL: 'VAR_NAME'});
        this.CONSUME(Assignment);
        this.SUBRULE(this.EXPR, {LABEL: 'VAR_VALUE'});
    });

    public BLOCK = this.RULE("BLOCK", () => {
        this.CONSUME(LCurly);
        this.MANY(() => this.SUBRULE(this.DECL, {LABEL: 'BLOCK_DECLARATIONS'}));
        this.SUBRULE(this.EXPR, {LABEL: 'BLOCK_VALUE'});
        this.CONSUME(RCurly);
    });

    //public BLOCK_BODY = this.RULE( "BLOCK_BODY")
    public OR_OP = this.RULE("OR_OP", () => {
        this.SUBRULE(this.AND_OP, {LABEL: 'LHS'});
        this.OPTION(() => {
            this.CONSUME(Operators.Or, {LABEL: 'OPERATOR'});
            this.SUBRULE1(this.OR_OP, {LABEL: 'RHS'});
        });
    });

    public AND_OP = this.RULE("AND_OP", () => {
        this.SUBRULE(this.COMPARE_OP, {LABEL: 'LHS'});
        this.OPTION(() => {
            this.CONSUME(Operators.And, {LABEL: 'OPERATOR'});
            this.SUBRULE1(this.AND_OP, {LABEL: 'RHS'});
        });
    });

    public COMPARE_OP = this.RULE("COMPARE_OP", () => {
        this.SUBRULE(this.EQ_OP, {LABEL: 'LHS'});
        this.OPTION(() => {
            this.CONSUME(Operators.CompareOperator, {LABEL: 'OPERATOR'});
            this.SUBRULE1(this.COMPARE_OP, {LABEL: 'RHS'});
        });
    });

    public EQ_OP = this.RULE("EQ_OP", () => {
        this.SUBRULE(this.CONS_OP, {LABEL: 'LHS'});
        this.OPTION(() => {
            this.CONSUME(Operators.EqualityOperator, {LABEL: 'OPERATOR'});
            this.SUBRULE1(this.EQ_OP, {LABEL: 'RHS'});
        });
    });

    public CONS_OP = this.RULE("CONS_OP", () => {
        this.SUBRULE(this.ADD_OP, {LABEL: 'LHS'});
        this.OPTION(() => {
            this.CONSUME(Operators.Cons, {LABEL: 'OPERATOR'});
            this.SUBRULE1(this.CONS_OP, {LABEL: 'RHS'});
        });
    });

    public ADD_OP = this.RULE("ADD_OP", () => {
        this.SUBRULE(this.MUL_OP, {LABEL: 'LHS'});
        this.OPTION(() => {
            this.CONSUME(Operators.AdditionOperator, {LABEL: 'OPERATOR'});
            this.SUBRULE1(this.ADD_OP, {LABEL: 'RHS'});
        });
    });

    public MUL_OP = this.RULE("MUL_OP", () => {
        this.SUBRULE(this.ATOM_EXPR, {LABEL: 'LHS'});
        this.OPTION(() => {
            this.CONSUME(Operators.MultiplicationOperator, {LABEL: 'OPERATOR'});
            this.SUBRULE1(this.MUL_OP, {LABEL: 'RHS'});
        });
    });

    public PAR_EXPR = this.RULE("PAR_EXPR", () => {
        this.CONSUME(LPar);
        this.SUBRULE1(this.EXPR);
        this.CONSUME(RPar);
    });

    public ATOM_EXPR = this.RULE("ATOM_EXPR", () => {
        this.OPTION(() => {
            this.CONSUME(Operators.UnaryOperator);
        });
        this.OR([
            {ALT: () => this.SUBRULE(this.GETTABLE_EXPR, {LABEL: 'ATOM'})},
            {ALT: () => this.SUBRULE(this.IF, {LABEL: 'ATOM'})},
            {ALT: () => this.SUBRULE(this.MATCH, {LABEL: 'ATOM'})},
            {ALT: () => this.SUBRULE(this.LITERAL, {LABEL: 'ATOM'})},
        ]);
    });

    public GETTABLE_EXPR = this.RULE("GETTABLE_EXPR", () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.PAR_EXPR, {LABEL: 'ITEM'})},
            {ALT: () => this.SUBRULE(this.BLOCK, {LABEL: 'ITEM'})},
            {ALT: () => this.SUBRULE(this.FUNCTION_CALL, {LABEL: 'ITEM'})},
            {ALT: () => this.SUBRULE(this.REFERENCE, {LABEL: 'ITEM'})}
        ]);
        this.MANY({
            GATE: () => {
                const nextToken = this.LA(1);
                return !(nextToken.image === '[' && (nextToken as any).afterSeparator);
            },
            DEF: () =>  this.OR2([
                {ALT: () => this.SUBRULE(this.LIST_ACCESS)},
                {
                    ALT: () => {
                        this.CONSUME(Dot);
                        this.OR1([
                            {ALT: () => this.SUBRULE1(this.FUNCTION_CALL)},
                            {ALT: () => this.SUBRULE1(this.IDENTIFIER, {LABEL: 'FIELD_ACCESS'})}
                        ]);
                    }
                }
            ])
        });
    });

    public LIST_ACCESS = this.RULE("LIST_ACCESS", () => {
        this.CONSUME(LSquare);
        this.OR([
            {ALT: () => this.CONSUME(IntegerLiteral)},
            {ALT: () => this.SUBRULE(this.REFERENCE)}
        ]);
        this.CONSUME(RSquare);
    });

    public IF = this.RULE("IF", () => {
        this.CONSUME(Keywords.If);
        this.SUBRULE(this.EXPR, {LABEL: 'CONDITION_EXPR'});
        this.CONSUME(Keywords.Then);
        this.SUBRULE1(this.EXPR, {LABEL: 'THEN_EXPR'});
        this.CONSUME(Keywords.Else);
        this.SUBRULE2(this.EXPR, {LABEL: 'ELSE_EXPR'});
    });

    public MATCH = this.RULE("MATCH", () => {
        this.CONSUME(Keywords.Match);
        this.SUBRULE(this.EXPR, {LABEL: 'MATCH_EXPR'});
        this.CONSUME(LCurly);
        this.AT_LEAST_ONE(() => this.SUBRULE(this.MATCH_CASE));
        this.CONSUME(RCurly);
    });

    public MATCH_CASE = this.RULE("MATCH_CASE", () => {
        this.CONSUME(Keywords.Case);
        this.OR([
            {
                ALT: () => {
                    this.SUBRULE(this.IDENTIFIER, {LABEL: 'CASE_VAR'});
                    this.CONSUME(Colon);
                    this.SUBRULE1(this.TYPE_REFERENCE, {LABEL: 'CASE_TYPE'});
                }
            },
            {ALT: () => this.CONSUME(Underscore)}
        ]);
        this.CONSUME(Arrow);
        this.SUBRULE(this.EXPR, {LABEL: 'CASE_BODY'});
    });

    public FUNCTION_CALL = this.RULE("FUNCTION_CALL", () => {
        this.SUBRULE(this.IDENTIFIER, {LABEL: 'FUNCTION_NAME'});
        this.CONSUME(LPar);
        this.MANY_SEP({
            SEP: Comma,
            DEF: () => this.SUBRULE(this.EXPR, {LABEL: 'FUNCTION_ARGS'})
        });
        this.CONSUME(RPar);
    });

    public LIST_LITERAL = this.RULE("LIST_LITERAL", () => {
        this.CONSUME(LSquare);
        this.MANY_SEP({
            SEP: Comma,
            DEF: () => this.SUBRULE(this.EXPR, {LABEL: 'LIST_ITEMS'})
        });
        this.CONSUME(RSquare);
        this.OPTION({
            GATE: () => {
                const nextToken = this.LA(1);
                return !(nextToken.image === '[' && (nextToken as any).afterSeparator);
            },
            DEF: () => this.SUBRULE(this.LIST_ACCESS)
        });
    });

    public LITERAL = this.RULE("LITERAL", () => {
        this.OR([
            {ALT: () => this.CONSUME(IntegerLiteral)},
            {ALT: () => this.CONSUME(StringLiteral)},
            {ALT: () => this.CONSUME(Base58Literal)},
            {ALT: () => this.CONSUME(Base64Literal)},
            {ALT: () => this.CONSUME(BooleanLiteral)},
            // {ALT: () => this.CONSUME(False)},
            {
                ALT: () => this.SUBRULE(this.LIST_LITERAL)
            }
        ]);
    });

    public IDENTIFIER = this.RULE("IDENTIFIER", () => {
        this.CONSUME(Identifier);
    });

    public REFERENCE = this.RULE("REFERENCE", () => {
        this.CONSUME(Identifier);
    });

    public TYPE_REFERENCE = this.RULE("TYPE_REFERENCE", () => {
        this.CONSUME(Identifier);
    });
}

export const rideParser = new RideParser();