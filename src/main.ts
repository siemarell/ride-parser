import { Lexer } from 'chevrotain';
import { allTokens } from './tokens';
import * as fs from "fs";
import { scriptInfo } from '@waves/ride-js';
import { rideParser as p } from './parser';
import { RideVisitor } from './visitor';

export function main (){
    const lexer = new Lexer(allTokens)

    const text = fs.readFileSync('dapp.ride', {encoding: 'utf-8'});
    const info = scriptInfo(text);

    let lexingResult = lexer.tokenize(text);


    p.input = lexingResult.tokens;
    console.log('Parser built');
    const cst = info.contentType === 1 ? p.SCRIPT(): p.DAPP();
    console.log(p.errors)
    const rideVisitor = new RideVisitor(info);

    const v = rideVisitor.visit(cst);

    console.dir(v, {depth: null});
}