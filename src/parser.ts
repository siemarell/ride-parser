import { Parser, IParserConfig } from 'chevrotain';
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
    StringLiteral, True, Underscore
} from './tokens';

const rideParserOpts: IParserConfig = {
    maxLookahead: 2,
    recoveryEnabled: true
};

class RideParser extends Parser {
    constructor() {
        super(allTokens, rideParserOpts);
        this.performSelfAnalysis();
    }

    public SCRIPT = this.RULE("SCRIPT", () => {
        this.MANY(() => this.SUBRULE(this.DECL));
        this.OR([
            //EXPRESSION
            {ALT: () => this.SUBRULE(this.EXPR)},
            //DAPP. Набор аннотированных функций
            {ALT: () => this.AT_LEAST_ONE(() => this.SUBRULE(this.ANNOTATEDFUNC))}
        ]);
    });


    public EXPR = this.RULE("EXPR", () => {
        this.SUBRULE(this.OR_OP, {LABEL: 'BINARY_OPERATION'});
    });

    public DECL = this.RULE("DECL", () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.FUNC)},
            {ALT: () => this.SUBRULE(this.LET)}
        ]);
    });

    public FUNC = this.RULE("FUNC", () => {
        this.CONSUME(Keywords.Func);
        this.CONSUME(Identifier);
        this.CONSUME(LPar);
        this.MANY_SEP({SEP: Comma, DEF: () => this.SUBRULE(this.FUNCTION_ARG)});
        this.CONSUME(RPar);
        this.CONSUME(Assignment);
        this.SUBRULE(this.EXPR);
    });

    public ANNOTATEDFUNC = this.RULE("ANNOTATEDFUNC", () => {
        this.CONSUME(Annotation);
        this.SUBRULE(this.FUNC);
    });

    public FUNCTION_ARG = this.RULE("FUNCTION_ARG", () => {
        this.CONSUME(Identifier);
        this.CONSUME(Colon);
        this.CONSUME1(Identifier);
    });

    public LET = this.RULE("LET", () => {
        this.CONSUME(Keywords.Let);
        this.CONSUME(Identifier, {LABEL: 'LHS'});
        this.CONSUME(Assignment);
        this.SUBRULE(this.EXPR, {LABEL: 'RHS'});
    });

    public BLOCK = this.RULE("BLOCK", () => {
        this.CONSUME(LCurly);
        this.MANY(() => this.SUBRULE(this.DECL));
        this.SUBRULE(this.EXPR);
        this.CONSUME(RCurly);
    });

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
            this.CONSUME(Operators.Cons);
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
            {ALT: () => this.CONSUME(Identifier, {LABEL: 'ITEM'})}
        ]);
        this.OPTION(() => {
            this.CONSUME(Dot);
            this.OR1([
                {ALT: () => this.SUBRULE1(this.FUNCTION_CALL)},
                {ALT: () => this.CONSUME1(Identifier, {LABEL:'FIELD_ACCESS'})}
            ]);
        },);
    });
    public IF = this.RULE("IF", () => {
        this.CONSUME(Keywords.If);
        this.SUBRULE(this.EXPR);
        this.CONSUME(Keywords.Then);
        this.SUBRULE1(this.EXPR);
        this.CONSUME(Keywords.Else);
        this.SUBRULE2(this.EXPR);
    });

    public MATCH = this.RULE("MATCH", () => {
        this.CONSUME(Keywords.Match);
        this.SUBRULE(this.EXPR);
        this.CONSUME(LCurly);
        this.AT_LEAST_ONE(() => this.SUBRULE(this.MATCH_CASE));
        this.CONSUME(RCurly);
    });

    public MATCH_CASE = this.RULE("MATCH_CASE", () => {
        this.CONSUME(Keywords.Case);
        this.OR([
            {
                ALT: () => {
                    this.CONSUME(Identifier);
                    this.CONSUME(Colon);
                    this.CONSUME1(Identifier);
                }
            },
            {ALT: () => this.CONSUME(Underscore)}
        ]);
        this.CONSUME(Arrow);
        this.SUBRULE(this.EXPR);
    });

    public FUNCTION_CALL = this.RULE("FUNCTION_CALL", () => {
        this.CONSUME(Identifier, {LABEL: 'FUNCTION_NAME'});
        this.CONSUME(LPar);
        this.MANY_SEP({
            SEP: Comma,
            DEF: () => this.SUBRULE(this.EXPR, {LABEL:'FUNCTION_ARGS'})
        });
        this.CONSUME(RPar);
    });

    public LIST_LITERAL = this.RULE("LIST_LITERAL", () => {
        this.CONSUME(LSquare);
        this.MANY_SEP({
            SEP: Comma,
            DEF: (this.SUBRULE(this.EXPR, {LABEL: 'LIST_ITEMS'}))
        })
        // this.OPTION(() => {
        //     this.SUBRULE(this.EXPR);
        //     this.MANY(() => {
        //         this.CONSUME(Comma);
        //         this.SUBRULE1(this.EXPR);
        //     });
        // });
        this.CONSUME(RSquare);
    });

    public LITERAL = this.RULE("LITERAL", () => {
        this.OR([
            {ALT: () => this.CONSUME(IntegerLiteral)},
            {ALT: () => this.CONSUME(StringLiteral)},
            {ALT: () => this.CONSUME(Base58Literal)},
            {ALT: () => this.CONSUME(Base64Literal)},
            {ALT: () => this.CONSUME(True)},
            {ALT: () => this.CONSUME(False)},
            {
                ALT: () => this.SUBRULE(this.LIST_LITERAL)
            }
        ]);
    });
}

export const rideParser = new RideParser();