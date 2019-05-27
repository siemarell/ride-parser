import {createToken, Lexer, }from 'chevrotain';
import * as fs from 'fs'
import {RideParser} from './parser'
import {allTokens} from './tokens';

const lexer = new Lexer(allTokens)

const text = fs.readFileSync('ride.ride', {encoding: 'utf-8'});
let lexingResult = lexer.tokenize(text);


//console.dir(lexingResult, {depth: null})


const p = new RideParser();
console.log('Parser built')
p.input = lexingResult.tokens
const res = p.SCRIPT()
console.dir(p.errors, {depth: null})
