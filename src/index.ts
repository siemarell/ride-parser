import {createToken, Lexer}from 'chevrotain';
import * as fs from 'fs'
import {allTokens} from './tokens';

const lexer = new Lexer(allTokens)

const text = fs.readFileSync('ride.ride', {encoding: 'utf-8'});
let lexingResult = lexer.tokenize(text);



console.dir(lexingResult, {depth: null})