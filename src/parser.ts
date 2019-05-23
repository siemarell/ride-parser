import { Parser } from 'chevrotain';
import {
    allTokens,
    Annotation,
    Assignment,
    Base58Literal,
    Identifier,
    IntegerLiteral,
    LCurly, Let,
    Operators,
    RCurly,
    StringLiteral
} from './tokens';

export class RideParser extends Parser {
    private DAPP: any;
    private EXPR: any;
    private LITERAL: any;
    private BLOCK_BODY: any;
    private BLOCK: any;
    private ANNOTATEDFUNC: any;
    private DECL: any;
    private BINARY_OP: any;
    private LET: any;
    constructor() {
        super(allTokens);
        const $ = this;

        $.RULE("SCRIPT", () => {
            $.OR([
                //EXPRESSION. На самом деле это не совсем EXPR, так как может быть блоком без скобок^
                {ALT: () => $.SUBRULE($.BLOCK_BODY)},
                //DAPP
                // {ALT: () => $.SUBRULE($.DAPP)}
            ]);
        });

        // $.RULE("DAPP", () => {
        //     $.MANY(() => {
        //         $.SUBRULE($.DECL);
        //     });
        //     $.AT_LEAST_ONE(() => $.SUBRULE($.ANNOTATEDFUNC));
        // });

        $.RULE("EXPR", () => {
            $.OR([
                {ALT: () => $.SUBRULE($.LITERAL)},
                // {ALT: () => $.SUBRULE($.BLOCK)},
                // {ALT: () => $.SUBRULE($.GETTER)},
                // {ALT: () => $.SUBRULE($.IF)},
                // {ALT: () => $.SUBRULE($.MATCH)},
                // {ALT: () => $.SUBRULE($.MATCH_CASE)},
                // {ALT: () => $.SUBRULE($.FUNCTION_CALL)},
                // {ALT: () => $.SUBRULE($.REF)},
                {ALT: () => $.SUBRULE($.BINARY_OP)},
            ]);
        });


        $.RULE("BLOCK_BODY", () => {
            // $.MANY(() => $.SUBRULE($.DECL));
            $.SUBRULE($.EXPR);
        });

        // $.RULE("BLOCK", () => {
        //     $.CONSUME(RCurly);
        //     $.SUBRULE($.BLOCK_BODY);
        //     $.CONSUME(LCurly);
        // });

        $.RULE("BINARY_OP", () => {
            $.SUBRULE($.EXPR, {LABEL: 'LHS'});
            $.CONSUME(Operators.BinaryOperator);
            $.SUBRULE($.EXPR, {LABEL: 'RHS'});
        });

        $.RULE("DECL", () => {
            $.OR([
                // {ALT: $.SUBRULE(() => $.FUNC)},
                {ALT: $.SUBRULE(() => $.LET)}
            ]);
        });

        $.RULE("LET", () => {
            $.CONSUME1(Let);
            $.CONSUME2(Identifier);
            $.CONSUME3(Assignment);
            // $.SUBRULE($.EXPR);
        });

        // $.RULE("ANNOTATEDFUNC", () => {
        //     $.CONSUME(Annotation);
        //     // $.SUBRULE($.FUNC);
        // });

        $.RULE("LITERAL", () => {
            $.OR([
                {ALT: () => $.CONSUME(IntegerLiteral)},
                {ALT: () => $.CONSUME(StringLiteral)},
                {ALT: () => $.CONSUME(Base58Literal)},
            ]);
        });

        this.performSelfAnalysis();
    }

}