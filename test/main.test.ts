import { createToken, Lexer, } from 'chevrotain';
import * as fs from 'fs';
import { rideParser as p } from '../src/parser';
import { allTokens } from '../src/tokens';
import { RideVisitor } from '../src/visitor';
import { scriptInfo } from '@waves/ride-js';

describe('basic', () => {

    it('runs', () => {

        const lexer = new Lexer(allTokens)

        const text = fs.readFileSync('script.ride', {encoding: 'utf-8'});
        const info = scriptInfo(text);

        let lexingResult = lexer.tokenize(text);


//console.dir(lexingResult, {depth: null})



        console.log('Parser built');
        p.input = lexingResult.tokens;
        const cst = info.contentType === 1 ? p.SCRIPT(): p.DAPP();
        const rideVisitor = new RideVisitor(info);
        const v = rideVisitor.visit(cst);

        console.dir(v, {depth: null});
        // console.log(123)
// console.dir(cst.children.DECL[0], {depth: 8})
// console.dir(cst, {depth: 8})
//console.log(v)
//console.dir(p.errors, {depth: null})

    });
});
