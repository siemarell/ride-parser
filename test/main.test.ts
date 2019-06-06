import { createToken, Lexer, } from 'chevrotain';
import * as fs from 'fs';
import { rideParser as p } from '../src/parser';
import { allTokens } from '../src/tokens';
import { RideVisitor } from '../src/visitor';
import { scriptInfo } from '@waves/ride-js';
import { main } from '../src/main';

describe('basic', () => {

    it('runs', () => {
      main()
    });
});
