import { MDN } from './data';
import {
    AtomicTerm, BracketsTerm, ComposedTerm, DataTypeTerm, KeywordTerm, Literal, LiteralTerm, MethodTerm, Term,
    TermCombinator, TermMultiplier, TermRange
} from './model';
import { doubleAmpersandIndexes, doubleBarIndexes, findEnd, makeMask, singleBarIndexes, spacesIndexes } from './utils';

export function resolveSyntaxByName(propertyName: string, recursive?: boolean): Term {
    return resolveSyntax(MDN.Properties[propertyName], recursive);
}

export function resolveSyntax(predicate: string, recursive?: boolean): Term {
    predicate = predicate.trim();
    let masked = mask(predicate);

    let combinator: TermCombinator;
    let points: number[];
    points = singleBarIndexes(masked);
    if (points.length) {
        combinator = TermCombinator.EXACTLY_ONE;
    }
    else {
        points = doubleBarIndexes(masked);
        if (points.length) {
            combinator = TermCombinator.AT_LEAST_ONE;
        }
        else {
            points = doubleAmpersandIndexes(masked);
            if (points.length) {
                combinator = TermCombinator.MANDATORY_ANY_ORDER;
            }
            else {
                points = spacesIndexes(masked);
                if (points.length) {
                    combinator = TermCombinator.MANDATORY_EXACT_ORDER;
                }
            }
        }
    }

    if (combinator != null) {
        let term = new ComposedTerm(predicate);
        term.combinator = combinator;
        let parts = split(predicate, points, <TermCombinator>combinator);

        for (let part of parts) {
            term.children.push(resolveSyntax(part, recursive));
        }
        return term;
    }
    else {
        return analyze(predicate, recursive);
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

function split(predicate: string, splitPoints: number[], combinator: TermCombinator): string[] {
    let step = 0;
    switch (combinator) {
        case TermCombinator.MANDATORY_EXACT_ORDER:
            step = 1;
            break;
        case TermCombinator.MANDATORY_ANY_ORDER:
            step = 2;
            break;
        case TermCombinator.AT_LEAST_ONE:
            step = 2;
            break;
        case TermCombinator.EXACTLY_ONE:
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

function analyze(predicate: string, recursive?: boolean): AtomicTerm {
    let value: string;
    let multiplier: TermMultiplier;
    let range: TermRange;
    let match;

    // MULTIPLIER
    if (predicate.endsWith('*')) {
        multiplier = TermMultiplier.ZERO_OR_MORE;
        value = predicate.slice(0, -1).trim();
    }
    else if (predicate.endsWith('+')) {
        multiplier = TermMultiplier.ONE_OR_MORE;
        value = predicate.slice(0, -1).trim();
    }
    else if (predicate.endsWith('?')) {
        multiplier = TermMultiplier.OPTIONAL;
        value = predicate.slice(0, -1).trim();
    }
    else if (predicate.endsWith('#')) {
        multiplier = TermMultiplier.ARRAY;
        value = predicate.slice(0, -1).trim();
    }
    else if (predicate.endsWith('!')) {
        multiplier = TermMultiplier.REQUIRED;
        value = predicate.slice(0, -1).trim();
    }
    else if ((match = isRange.exec(predicate)) !== null) {
        multiplier = TermMultiplier.RANGE;
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

    let term: AtomicTerm;

    // BRACKETS
    if (value.startsWith('[')) {
        if (!value.endsWith(']')) {
            throw new Error('Malformed brackets');
        }
        term = new BracketsTerm(predicate);
        (<BracketsTerm>term).content = resolveSyntax(value.slice(1, -1), recursive);
    }
    // DATA TYPE
    else if (value.startsWith('<')) {
        if (!value.endsWith('>')) {
            throw new Error('Malformed data type');
        }
        term = new DataTypeTerm(predicate);
        let name = value.slice(1, -1);
        if (name.startsWith('\'')) {
            if (!name.endsWith('\'')) {
                throw new Error('Malformed data type name');
            }
            (<DataTypeTerm>term).name = name.slice(1, -1);
            (<DataTypeTerm>term).nonTerminal = true;
        }
        else {
            (<DataTypeTerm>term).name = name;
            (<DataTypeTerm>term).nonTerminal = false;
        }

        if (recursive) {
            const recursiveSource = (<DataTypeTerm>term).nonTerminal ? MDN.Properties : MDN.Syntaxes;
            const recursiveSyntax = recursiveSource[(<DataTypeTerm>term).name];
            term = new BracketsTerm(recursiveSyntax);
            (<BracketsTerm>term).content = resolveSyntax(recursiveSyntax, recursive);
        }
    }
    else {
        // LITERAL
        if (Object.values(Literal).includes(value)) {
            term = new LiteralTerm(predicate);
        }
        // METHOD
        else if (value.includes('(')) {
            if (!value.endsWith(')')) {
                throw new Error('Malformed method');
            }
            let openBrace = value.indexOf('(');
            term = new MethodTerm(predicate);
            (<MethodTerm>term).name = value.substr(0, openBrace);

            let params = value.slice(openBrace + 1, -1);
            if (params.length) {
                (<MethodTerm>term).params = resolveSyntax(params, recursive);
            }
        }
        // KEYWORD
        else {
            term = new KeywordTerm(predicate);
        }
    }

    term.multiplier = multiplier;
    if (range) {
        term.range = range;
    }

    return term;
}
