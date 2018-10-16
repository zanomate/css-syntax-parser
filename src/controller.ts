import {
    SyntaxAtomicTerm, SyntaxBrackets, SyntaxCombinator, SyntaxComposedTerm, SyntaxDataType, SyntaxKeyword, SyntaxLiteral, SyntaxLiteralSymbol, SyntaxMethod, SyntaxMultiplier,
    SyntaxRange, SyntaxTerm
} from './model';
import { doubleAmpersandIndexes, doubleBarIndexes, findEnd, makeMask, singleBarIndexes, spacesIndexes } from './utils';

export function resolveSyntax(predicate: string): SyntaxTerm {
    predicate = predicate.trim();
    let masked = mask(predicate);

    let combinator: SyntaxCombinator;
    let points: number[];
    points = singleBarIndexes(masked);
    if (points.length) {
        combinator = SyntaxCombinator.EXACTLY_ONE;
    }
    else {
        points = doubleBarIndexes(masked);
        if (points.length) {
            combinator = SyntaxCombinator.AT_LEAST_ONE;
        }
        else {
            points = doubleAmpersandIndexes(masked);
            if (points.length) {
                combinator = SyntaxCombinator.MANDATORY_ANY_ORDER;
            }
            else {
                points = spacesIndexes(masked);
                if (points.length) {
                    combinator = SyntaxCombinator.MANDATORY_EXACT_ORDER;
                }
            }
        }
    }

    if (combinator != null) {
        let term = new SyntaxComposedTerm(predicate);
        term.combinator = combinator;
        let parts = split(predicate, points, <SyntaxCombinator>combinator);

        for (let part of parts) {
            term.children.push(resolveSyntax(part));
        }
        return term;
    }
    else {
        return analyze(predicate);
    }
}

/* MASK */

function mask(predicate: string): string {
    let mask = predicate;
    mask = maskBy(mask, '[', ']');
    mask = maskBy(mask, '(', ')');
    mask = maskBy(mask, '<', '>');
    return mask;
}

function maskBy(predicate: string, open: string, close: string): string {
    let start;
    let last = 0;
    while ((start = predicate.indexOf(open, last)) >= 0) {
        const end = findEnd(predicate, start, open, close);
        predicate = predicate.substr(0, start + 1) + makeMask(end - start - 1) + predicate.substr(end);
        last = end + 1;
    }
    return predicate;
}

/* SPLIT */

function split(predicate: string, splitPoints: number[], combinator: SyntaxCombinator): string[] {
    let step = 0;
    switch (combinator) {
        case SyntaxCombinator.MANDATORY_EXACT_ORDER:
            step = 1;
            break;
        case SyntaxCombinator.MANDATORY_ANY_ORDER:
            step = 2;
            break;
        case SyntaxCombinator.AT_LEAST_ONE:
            step = 2;
            break;
        case SyntaxCombinator.EXACTLY_ONE:
            step = 1;
            break;
        default:
            throw new Error('Unknown combinator');
    }

    let parts: string[] = [];
    let start = 0;
    for (let splitPoint of splitPoints) {
        parts.push(predicate.substring(start, splitPoint).trim());
        start = splitPoint + step;
    }
    parts.push(predicate.substring(start).trim());
    return parts;
}

const isRange = /{([0-9]+),([0-9]+)}$/;

function analyze(predicate: string): SyntaxAtomicTerm {
    let value: string;
    let multiplier: SyntaxMultiplier;
    let range: SyntaxRange;
    let match;

    // MULTIPLIER
    if (predicate.endsWith('*')) {
        multiplier = SyntaxMultiplier.ZERO_OR_MORE;
        value = predicate.slice(0, -1).trim();
    }
    else if (predicate.endsWith('+')) {
        multiplier = SyntaxMultiplier.ONE_OR_MORE;
        value = predicate.slice(0, -1).trim();
    }
    else if (predicate.endsWith('?')) {
        multiplier = SyntaxMultiplier.OPTIONAL;
        value = predicate.slice(0, -1).trim();
    }
    else if (predicate.endsWith('#')) {
        multiplier = SyntaxMultiplier.ARRAY;
        value = predicate.slice(0, -1).trim();
    }
    else if (predicate.endsWith('!')) {
        multiplier = SyntaxMultiplier.REQUIRED;
        value = predicate.slice(0, -1).trim();
    }
    else if ((match = isRange.exec(predicate)) !== null) {
        multiplier = SyntaxMultiplier.RANGE;
        range = {};
        if (match[1]) {
            range.min = parseInt(match[1]);
        }
        if (match[2]) {
            range.max = parseInt(match[2]);
        }
        value = predicate.slice(0, -match[0].length).trim();
    }
    else {
        value = predicate;
    }

    let term;

    // BRACKETS
    if (value.startsWith('[')) {
        if (!value.endsWith(']')) {
            throw new Error('Malformed brackets');
        }
        term = new SyntaxBrackets(predicate);
        term.content = resolveSyntax(value.slice(1, -1));
    }
    // DATA TYPE
    else if (value.startsWith('<')) {
        if (!value.endsWith('>')) {
            throw new Error('Malformed data type');
        }
        term = new SyntaxDataType(predicate);
        let name = value.slice(1, -1);
        if (name.startsWith('\'')) {
            if (!name.endsWith('\'')) {
                throw new Error('Malformed data type name');
            }
            term.name = name.slice(1, -1);
            term.nonTerminal = true;
        }
        else {
            term.name = name;
            term.nonTerminal = false;
        }
    }
    else {
        // LITERAL
        if (Object.values(SyntaxLiteralSymbol).includes(value)) {
            term = new SyntaxLiteral(predicate);
        }
        // METHOD
        else if (value.includes('(')) {
            if (!value.endsWith(')')) {
                throw new Error('Malformed method');
            }
            let openBrace = value.indexOf('(');
            term = new SyntaxMethod(predicate);
            term.name = value.substr(0, openBrace);

            let params = value.slice(openBrace + 1, -1);
            if (params.length) {
                term.params = resolveSyntax(params);
            }
        }
        // KEYWORD
        else {
            term = new SyntaxKeyword(predicate);
        }
    }

    term.multiplier = multiplier;
    if (range) {
        term.range = range;
    }

    return term;
}
