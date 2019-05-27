import { Parser, IParserConfig } from 'chevrotain';
import {
    allTokens,
    Annotation,
    Assignment,
    Base58Literal, Colon, Comma, False,
    Identifier,
    IntegerLiteral, Keywords,
    LCurly, LPar,
    Operators,
    RCurly, RPar,
    StringLiteral, True
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
        this.MANY(() => this.SUBRULE(this.DECL));
        this.OR([
            //EXPRESSION
            {ALT: () => this.SUBRULE(this.EXPR)},
            //DAPP. Набор аннотированных функций
            {ALT: () => this.AT_LEAST_ONE(() => this.SUBRULE(this.ANNOTATEDFUNC))}
        ]);
    });


    public EXPR = this.RULE("EXPR", () => {
        this.OR([
            {ALT: () => this.SUBRULE(this.BINARY_OP)},
        ]);
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
        this.CONSUME(Identifier);
        this.CONSUME(Assignment);
        this.SUBRULE(this.EXPR);
    });

    public BLOCK = this.RULE("BLOCK", () => {
        this.CONSUME(LCurly);
        this.MANY(() => this.SUBRULE(this.DECL));
        this.SUBRULE(this.EXPR);
        this.CONSUME(RCurly);
    });

    public BINARY_OP = this.RULE("BINARY_OP", () => {
        this.SUBRULE(this.OR_OP);
    });

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
        this.SUBRULE(this.ATOM_EXPR, {LABEL: 'LHS'});
        this.OPTION(() => {
            this.CONSUME(Operators.MultiplicationOperator);
            this.SUBRULE1(this.MUL_OP, {LABEL: 'RHS'});
        });
    });

    // public UNARY_OP = this.RULE("UNARY_OP", () => {
    //     this.OR([
    //         {ALT: () => this.SUBRULE(this.ATOM_EXPR)},
    //         {
    //             ALT: () => {
    //                 this.CONSUME(Operators.UnaryOperator);
    //                 this.SUBRULE1(this.ATOM_EXPR);
    //             }
    //         }
    //     ]);
    // });

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
            // {ALT: () => this.SUBRULE(this.GETTER)},
            {ALT: () => this.SUBRULE(this.IF)},
            // {ALT: () => this.SUBRULE(this.MATCH)},
            // {ALT: () => this.SUBRULE(this.MATCH_CASE)},
            // {ALT: () => this.SUBRULE(this.FUNCTION_CALL)},
            // {ALT: () => this.SUBRULE(this.REF)},
            {ALT: () => this.SUBRULE(this.BLOCK)},
            {ALT: () => this.SUBRULE(this.PAR_EXPR)},
            {ALT: () => this.SUBRULE(this.LITERAL)},
            {ALT: () => this.CONSUME(Identifier)}
        ]);
    });

    public IF = this.RULE("IF", () => {
        this.CONSUME(Keywords.If);
        this.SUBRULE(this.EXPR);
        this.CONSUME(Keywords.Then);
        this.SUBRULE1(this.EXPR);
        this.CONSUME(Keywords.Else);
        this.SUBRULE2(this.EXPR);
    });

    public LITERAL = this.RULE("LITERAL", () => {
        this.OR([
            {ALT: () => this.CONSUME(IntegerLiteral)},
            {ALT: () => this.CONSUME(StringLiteral)},
            {ALT: () => this.CONSUME(Base58Literal)},
            {ALT: () => this.CONSUME(True)},
            {ALT: () => this.CONSUME(False)},
        ]);
    });

}