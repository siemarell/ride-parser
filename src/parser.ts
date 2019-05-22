import { Parser } from 'chevrotain';
import { allTokens } from './tokens';

class RideParser extends Parser {
    constructor() {
        super(allTokens);
        const $: any = this;

        $.RULE("Script", () => {
            $.OR([
                {ALT: () => $.SUBRULE($.expression)},
                {ALT: () => $.SUBRULE($.dApp)}
            ]);
        });

        $.RULE("expression", () => {

        });

        $.RULE("dApp", () => {

        });

        $.RULE("block", () => {

        })

        this.performSelfAnalysis();
    }

}