/* VALUES */

export enum SyntaxTermType {
    LITERAL = 'literal',
    KEYWORD = 'keyword',
    METHOD = 'method',
    DATA_TYPE = 'data-type',
    COMPOSED = 'composed',
    BRACKETS = 'brackets'
}

export enum SyntaxLiteralSymbol {
    SLASH = '/',
    COMMA = ',',
}

export enum SyntaxCombinator {
    MANDATORY_EXACT_ORDER = ' ',
    MANDATORY_ANY_ORDER = '&&',
    AT_LEAST_ONE = '||',
    EXACTLY_ONE = '|'
}

export enum SyntaxMultiplier {
    ZERO_OR_MORE = '*',
    ONE_OR_MORE = '+',
    OPTIONAL = '?',
    RANGE = '{}',
    ARRAY = '#',
    REQUIRED = '!',
}

export interface SyntaxRange {
    min?: number,
    max?: number
}

/* TERMS */

export class SyntaxTerm {
    readonly _value: string;
    readonly type: SyntaxTermType;

    constructor(type: SyntaxTermType, _value: string) {
        this._value = _value;
        this.type = type;
    }
}

export class SyntaxComposedTerm extends SyntaxTerm {
    combinator: SyntaxCombinator;
    children: SyntaxTerm[] = [];

    constructor(_value: string) {
        super(SyntaxTermType.COMPOSED, _value);
    }
}

export class SyntaxAtomicTerm extends SyntaxTerm {
    multiplier: SyntaxMultiplier;
    range?: SyntaxRange;
}

/* ATOMIC TERMS */

export class SyntaxLiteral extends SyntaxAtomicTerm {
    constructor(_value: string) {
        super(SyntaxTermType.LITERAL, _value);
    }
}

export class SyntaxKeyword extends SyntaxAtomicTerm {
    constructor(_value: string) {
        super(SyntaxTermType.KEYWORD, _value);
    }
}

export class SyntaxMethod extends SyntaxAtomicTerm {
    name: string;
    params: SyntaxTerm;

    constructor(_value: string) {
        super(SyntaxTermType.METHOD, _value);
    }
}

export class SyntaxDataType extends SyntaxAtomicTerm {
    name: string;
    nonTerminal: boolean;

    constructor(_value: string) {
        super(SyntaxTermType.DATA_TYPE, _value);
    }
}

export class SyntaxBrackets extends SyntaxAtomicTerm {
    content: SyntaxTerm;

    constructor(_value: string) {
        super(SyntaxTermType.BRACKETS, _value);
    }
}

