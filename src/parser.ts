import { Parser } from 'chevrotain';
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

export class RideParser extends Parser {
    constructor() {
        super(allTokens);
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
        // this.MANY(() => this.SUBRULE(this.DECL));
        this.SUBRULE(this.EXPR);
    });

    // public BLOCK = this.RULE("BLOCK", () => {
    //     this.CONSUME(RCurly);
    //     this.SUBRULE(this.BLOCK_BODY);
    //     this.CONSUME(LCurly);
    // });

    public BINARY_OP = this.RULE("BINARY_OP", () => {
        this.SUBRULE(this.ATOM, {LABEL: 'LHS'});
        this.OPTION(()=> {
            this.CONSUME(Operators.BinaryOperator);
            this.SUBRULE1(this.ATOM, {LABEL: 'RHS'})
        })
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
                ALT: () => this.SUBRULE(this.LITERAL)
            }
        ])
    })

    // public DECL = this.RULE("DECL", () => {
    //     this.OR([
    //         // {ALT: this.SUBRULE(() => this.FUNC)},
    //         {ALT: this.SUBRULE(() => this.LET)}
    //     ]);
    // });

    // public LET = this.RULE("LET", () => {
    //     this.CONSUME1(Let);
    //     this.CONSUME2(Identifier);
    //     this.CONSUME3(Assignment);
    //     // this.SUBRULE(this.EXPR);
    // });

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