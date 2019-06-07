import { IToken, Lexer, tokenMatcher } from 'chevrotain';
import { allTokens, WhiteSpace } from './tokens';
import * as fs from "fs";
import { scriptInfo } from '@waves/ride-js';
import { rideParser as p } from './parser';
import { RideVisitor } from './visitor';

export function main (){
    const lexer = new Lexer(allTokens)

    const text = fs.readFileSync('assets/fomo.ride', {encoding: 'utf-8'});
    const info = scriptInfo(text);

    let lexingResult = lexer.tokenize(text);

    const tokens: IToken[] = []
    lexingResult.tokens.forEach((t,i) => {
        if (!tokenMatcher(t, WhiteSpace)){
            tokens.push(t)
            const prevToken = lexingResult.tokens[i-1];
            if(prevToken && tokenMatcher(prevToken, WhiteSpace)) {
                (t as any).afterSeparator = true
            }
        }
    })

    p.input = tokens;
    console.log('Parser built');
    const cst = info.contentType === 1 ? p.SCRIPT(): p.DAPP();
    console.log(p.errors)
    const rideVisitor = new RideVisitor(info);

    const v = rideVisitor.visit(cst);

    console.dir(v, {depth: null});
}