import { MDN } from './data';
import {
    AtomicTerm, BracketsTerm, ComposedTerm, DataTypeTerm, KeywordTerm, Literal, LiteralTerm, MethodTerm, StringTerm,
    Term, TermCombinator, TermMultiplier, TermRange
} from './model';
import { allIndexes, mask } from './utils';

export class Resolver {
    readonly recursive: boolean;
    private alreadyVisited: string[];

    constructor(recursive: boolean) {
        this.recursive = recursive;
        this.alreadyVisited = [];
    }

    public resolve(syntax: string): Term {
        return this.resolvePredicate(syntax);
    }

    private resolvePredicate(predicate: string): Term {

        // Check if predicate is defined
        if (!predicate) {
            throw new Error(`invalid predicate '${predicate}'`);
        }

        // Replace encoded characters
        predicate = predicate
            .replace('&lt;', '<')
            .replace('&gt;', '>')
            .replace('&amp;', '&')
            .trim();

        // Mask every nested content
        let maskedPredicate = predicate;
        maskedPredicate = mask(maskedPredicate, '\'', '\'');
        maskedPredicate = mask(maskedPredicate, '[', ']');
        maskedPredicate = mask(maskedPredicate, '(', ')');
        maskedPredicate = mask(maskedPredicate, '<', '>');
        maskedPredicate = mask(maskedPredicate, '{', '}');

        let term;

        // Composed term
        let combinator = Resolver.findCombinator(maskedPredicate);
        if (combinator != null) {
            term = new ComposedTerm(predicate);
            term.combinator = combinator;
            term.children = Resolver.split(maskedPredicate, predicate, combinator)
                .map(part => this.resolvePredicate(part));
        }

        // Atomic term
        else {
            term = this.resolveAtomicPredicate(predicate);
        }

        return term;
    }

    private static findCombinator(predicate: string): TermCombinator {

        // Single bar
        let maskedPredicate = predicate.replace(/\|\|/g, '  ');
        if (maskedPredicate.includes('|'))
            return TermCombinator.SINGLE_BAR;

        // Double bar
        if (predicate.includes('||'))
            return TermCombinator.DOUBLE_BAR;

        // Double ampersand
        if (predicate.includes('&&'))
            return TermCombinator.DOUBLE_AMPERSAND;

        // Juxtaposition
        if (predicate.substr(1).search(/[\s\[<,]/) >= 0)
            return TermCombinator.JUXTAPOSITION;

        return null;
    }

    private static split(maskedPredicate: string, predicate: string, combinator: TermCombinator): string[] {
        let splitPoints: number[];
        let step;
        switch (combinator) {
            case TermCombinator.SINGLE_BAR:
                splitPoints = allIndexes(maskedPredicate, /\|/);
                step = 1;
                break;
            case TermCombinator.DOUBLE_BAR:
                splitPoints = allIndexes(maskedPredicate, /\|\|/);
                step = 2;
                break;
            case TermCombinator.DOUBLE_AMPERSAND:
                splitPoints = allIndexes(maskedPredicate, /&&/);
                step = 2;
                break;
            case TermCombinator.JUXTAPOSITION:
                splitPoints = allIndexes(maskedPredicate, /[\s\[<,]/);
                step = 0;
                break;
            default:
                throw new Error('unknown combinator');
        }

        let parts: string[] = [];
        let start = 0;
        for (let splitPoint of splitPoints) {
            parts.push(predicate.substring(start, splitPoint));
            start = splitPoint + step;
        }
        parts.push(predicate.substring(start));

        return parts
            .map(part => part.trim())
            .filter(part => part !== '');
    }

    private resolveAtomicPredicate(predicate: string): AtomicTerm {
        let term: AtomicTerm;
        let multiplier: TermMultiplier;

        // Range
        let range: TermRange;
        let match;
        if ((match = /{([0-9]+)?(,([0-9]+)?)?}$/.exec(predicate)) !== null) {
            multiplier = TermMultiplier.RANGE;
            range = {
                min: match[1] ? parseInt(match[1]) : undefined,
                max: match[3] ? parseInt(match[3]) : undefined
            };
            predicate = predicate.slice(0, -match[0].length).trim();
        }


        // Multiplier
        if (predicate.endsWith('*')) {
            multiplier = TermMultiplier.ZERO_OR_MORE;
            predicate = predicate.slice(0, -1).trim();
        }
        else if (predicate.endsWith('+')) {
            multiplier = TermMultiplier.ONE_OR_MORE;
            predicate = predicate.slice(0, -1).trim();
        }
        else if (predicate.endsWith('?')) {
            multiplier = TermMultiplier.OPTIONAL;
            predicate = predicate.slice(0, -1).trim();
        }
        else if (predicate.endsWith('#')) {
            multiplier = TermMultiplier.LIST;
            predicate = predicate.slice(0, -1).trim();
        }
        else if (predicate.endsWith('!')) {
            multiplier = TermMultiplier.REQUIRED;
            predicate = predicate.slice(0, -1).trim();
        }

        // Brackets
        if (predicate.startsWith('[')) {
            if (!predicate.endsWith(']')) {
                throw new Error('malformed brackets');
            }
            term = new BracketsTerm(predicate);
            (<BracketsTerm>term).content = this.resolvePredicate(predicate.slice(1, -1));
        }
        // Data Type
        else if (predicate.startsWith('<')) {
            if (!predicate.endsWith('>')) {
                throw new Error('malformed data type');
            }
            term = new DataTypeTerm(predicate);
            let name = predicate.slice(1, -1);
            // Non-terminal
            if (name.startsWith('\'')) {
                if (!name.endsWith('\'')) {
                    throw new Error('Malformed non-terminal data type');
                }
                (<DataTypeTerm>term).name = name.slice(1, -1);
                (<DataTypeTerm>term).nonTerminal = true;
            }
            // Terminal
            else {
                (<DataTypeTerm>term).name = name;
                (<DataTypeTerm>term).nonTerminal = false;
            }

            const dataTypeName = (<DataTypeTerm>term).name;

            // Recursive resolve
            if (this.recursive && !this.alreadyVisited.includes(dataTypeName)) {
                this.alreadyVisited.push(dataTypeName);
                const recursiveSource = (<DataTypeTerm>term).nonTerminal ? MDN.Properties : MDN.Syntaxes;
                if (recursiveSource.hasOwnProperty(dataTypeName)) {
                    const recursiveSyntax = recursiveSource[dataTypeName];
                    term = new BracketsTerm(recursiveSyntax);
                    (<BracketsTerm>term).content = this.resolvePredicate(recursiveSyntax);
                }
            }
        }
        else if (predicate.startsWith('\'')) {
            if (!predicate.endsWith('\'')) {
                throw new Error('malformed string');
            }
            let value = predicate.slice(1, -1);
            term = new StringTerm(value);
        }
        // Method
        else if (predicate.includes('(')) {
            if (!predicate.endsWith(')')) {
                throw new Error('malformed method');
            }
            let openBrace = predicate.indexOf('(');
            term = new MethodTerm(predicate);
            (<MethodTerm>term).name = predicate.substr(0, openBrace);

            let params = predicate.slice(openBrace + 1, -1);
            if (params.length) {
                (<MethodTerm>term).params = this.resolvePredicate(params);
            }
        }
        // Literal
        else if (Object.values(Literal).includes(predicate)) {
            term = new LiteralTerm(predicate);
        }
        // Keyword
        else {
            term = new KeywordTerm(predicate);
        }

        term.multiplier = multiplier;
        term.range = range;
        return term;
    }
}
