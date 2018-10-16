import { AtomicTerm, BracketsTerm, ComposedTerm, DataTypeTerm, KeywordTerm, LiteralTerm, MethodTerm, resolveSyntax, Term } from '../src';

let syntax = resolveSyntax(`[ <length> | <percentage> | auto ]{1,4}`);
printTerm(syntax, 0);

function printTerm(term: Term, indent: number) {
    let indentation = '';
    if (indent > 0) {
        for (let i = 0; i < indent - 1; i++) {
            indentation += '  ';
        }
        indentation += '> ';
    }

    if (term instanceof ComposedTerm) {
        printLine(indentation, '[Composed]', (<ComposedTerm>term)._value);
        (<ComposedTerm>term).children.map(child => printTerm(child, indent + 1));
    }
    else if (term instanceof AtomicTerm) {
        if (term instanceof LiteralTerm) {
            printLine(indentation, '[Literal]', (<LiteralTerm>term)._value);
        }
        else if (term instanceof KeywordTerm) {
            printLine(indentation, '[Keyword]', (<KeywordTerm>term)._value);
        }
        else if (term instanceof DataTypeTerm) {
            printLine(indentation, '[DataType]', (<LiteralTerm>term)._value);
        }
        else if (term instanceof MethodTerm) {
            printLine(indentation, '[Method]', (<LiteralTerm>term)._value);
            if ((<MethodTerm>term).params) {
                printTerm((<MethodTerm>term).params, indent + 1)
            }
        }
        else if (term instanceof BracketsTerm) {
            printLine(indentation, 'BRACKETS', (<LiteralTerm>term)._value);
            printTerm((<BracketsTerm>term).content, indent + 1);
        }
    }
    else {
        throw new Error('unknown term: ' + term);
    }
}

function printLine(indentation: string, key: string, value?: string) {
    let print = indentation + key;
    if (value) {
        print += ': ' + value;
    }
    console.log(print);
}
