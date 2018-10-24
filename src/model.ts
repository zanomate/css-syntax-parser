/* VALUES */

import { indent } from './utils';

export enum TermType {
    LITERAL = 'literal',
    KEYWORD = 'keyword',
    METHOD = 'method',
    DATA_TYPE = 'data-type',
    COMPOSED = 'composed',
    BRACKETS = 'brackets'
}

export enum Literal {
    SLASH = '/',
    COMMA = ',',
}

export enum TermCombinator {
    JUXTAPOSITION = ' ',
    DOUBLE_AMPERSAND = '&&',
    DOUBLE_BAR = '||',
    SINGLE_BAR = '|'
}

export enum TermMultiplier {
    ZERO_OR_MORE = '*',
    ONE_OR_MORE = '+',
    OPTIONAL = '?',
    RANGE = '{range}',
    LIST = '#',
    REQUIRED = '!',
}

export interface TermRange {
    min?: number,
    max?: number
}

/* TERMS */

export abstract class Term {
    readonly _value: string;
    readonly type: TermType;

    protected constructor(type: TermType, _value: string) {
        this._value = _value;
        this.type = type;
    }

    abstract print(indentation?: number): void;
}

export class ComposedTerm extends Term {
    combinator: TermCombinator;
    children: Term[] = [];

    constructor(_value: string) {
        super(TermType.COMPOSED, _value);
    }

    print(indentation: number = 0): void {
        console.log(indent(indentation) + 'COMPOSED');
        console.log(indent(indentation) + '-combinator:', this.combinator);
        this.children.map(child => child.print(indentation + 1));
    }
}

export abstract class AtomicTerm extends Term {
    multiplier: TermMultiplier;
    range: TermRange;

    print(indentation: number = 0): void {
        if (this.multiplier) {
            console.log(indent(indentation) + '-multiplier:', this.multiplier);
        }
        if (this.range) {
            console.log(indent(indentation) + '-range:', this.range);
        }
    }
}

/* ATOMIC TERMS */

export class LiteralTerm extends AtomicTerm {
    constructor(_value: string) {
        super(TermType.LITERAL, _value);
    }

    print(indentation: number = 0): void {
        console.log(indent(indentation) + 'LITERAL');
        console.log(indent(indentation) + '-value:', this._value);
        super.print(indentation);
        console.log(indent(indentation));
    }
}

export class KeywordTerm extends AtomicTerm {
    constructor(_value: string) {
        super(TermType.KEYWORD, _value);
    }

    print(indentation: number = 0): void {
        console.log(indent(indentation) + 'KEYWORD');
        console.log(indent(indentation) + '-value:', this._value);
        super.print(indentation);
        console.log(indent(indentation));
    }
}

export class MethodTerm extends AtomicTerm {
    name: string;
    params: Term;

    constructor(_value: string) {
        super(TermType.METHOD, _value);
    }

    print(indentation: number = 0): void {
        console.log(indent(indentation) + 'METHOD');
        console.log(indent(indentation) + '-name', this.name);
        super.print(indentation);
        console.log(indent(indentation) + '(');
        this.params.print(indentation + 1);
        console.log(indent(indentation) + ')');
        console.log(indent(indentation));
    }
}

export class DataTypeTerm extends AtomicTerm {
    name: string;
    nonTerminal: boolean;

    constructor(_value: string) {
        super(TermType.DATA_TYPE, _value);
    }

    print(indentation: number = 0): void {
        console.log(indent(indentation) + 'DATA TYPE');
        console.log(indent(indentation) + '-name:', this.name);
        console.log(indent(indentation) + '-non-terminal:', this.nonTerminal);
        super.print(indentation);
        console.log(indent(indentation));
    }
}

export class BracketsTerm extends AtomicTerm {
    content: Term;

    constructor(_value: string) {
        super(TermType.BRACKETS, _value);
    }

    print(indentation: number = 0): void {
        console.log(indent(indentation) + '[');
        this.content.print(indentation + 1);
        console.log(indent(indentation) + ']');
        super.print(indentation);
        console.log(indent(indentation));
    }
}

