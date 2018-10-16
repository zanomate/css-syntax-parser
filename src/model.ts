/* VALUES */

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
    MANDATORY_EXACT_ORDER = 'mandatory exact order',
    MANDATORY_ANY_ORDER = 'mandatory any order',
    AT_LEAST_ONE = 'at least one',
    EXACTLY_ONE = 'exactly one'
}

export enum TermMultiplier {
    ZERO_OR_MORE = 'zero or more',
    ONE_OR_MORE = 'one or more',
    OPTIONAL = 'optional',
    RANGE = 'range',
    ARRAY = 'array',
    REQUIRED = 'required',
}

export interface TermRange {
    min?: number,
    max?: number
}

/* TERMS */

export class Term {
    readonly _value: string;
    readonly type: TermType;

    constructor(type: TermType, _value: string) {
        this._value = _value;
        this.type = type;
    }
}

export class ComposedTerm extends Term {
    combinator: TermCombinator;
    children: Term[] = [];

    constructor(_value: string) {
        super(TermType.COMPOSED, _value);
    }
}

export class AtomicTerm extends Term {
    multiplier: TermMultiplier;
    range?: TermRange;
}

/* ATOMIC TERMS */

export class LiteralTerm extends AtomicTerm {
    constructor(_value: string) {
        super(TermType.LITERAL, _value);
    }
}

export class KeywordTerm extends AtomicTerm {
    constructor(_value: string) {
        super(TermType.KEYWORD, _value);
    }
}

export class MethodTerm extends AtomicTerm {
    name: string;
    params: Term;

    constructor(_value: string) {
        super(TermType.METHOD, _value);
    }
}

export class DataTypeTerm extends AtomicTerm {
    name: string;
    nonTerminal: boolean;

    constructor(_value: string) {
        super(TermType.DATA_TYPE, _value);
    }
}

export class BracketsTerm extends AtomicTerm {
    content: Term;

    constructor(_value: string) {
        super(TermType.BRACKETS, _value);
    }
}

