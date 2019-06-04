import { createToken, Lexer, } from 'chevrotain';
import * as fs from 'fs';
import { rideParser as p } from '../src/parser';
import { allTokens } from '../src/tokens';
import { RideVisitor } from '../src/visitor';

describe('basic', () => {

    it('runs', () => {


        const lexer = new Lexer(allTokens);

        const text = fs.readFileSync('a.ride', {encoding: 'utf-8'});
        let lexingResult = lexer.tokenize(text);


//console.dir(lexingResult, {depth: null})

        p.input = lexingResult.tokens;
        const cst = p.SCRIPT();
        const rideVisitor = new RideVisitor();
        const v = rideVisitor.visit(cst);
        const st = rideVisitor.rootSymbolTable;
        console.log(p.errors)
        console.log(v);
        // console.log(123)
// console.dir(cst.children.DECL[0], {depth: 8})
// console.dir(cst, {depth: 8})
//console.log(v)
//console.dir(p.errors, {depth: null})

    });
});
