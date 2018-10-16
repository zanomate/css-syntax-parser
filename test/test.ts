import { SyntaxAtomicTerm, SyntaxBrackets, SyntaxComposedTerm, SyntaxDataType, SyntaxKeyword, SyntaxLiteral, SyntaxMethod, resolveSyntax, SyntaxTerm } from '../src';

let syntax = resolveSyntax(`[ <length> | <percentage> | auto ]{1,4}`);
printTerm(syntax, 0);

function printTerm(term: SyntaxTerm, indent: number) {
    let indentation = '';
    if (indent > 0) {
        for (let i = 0; i < indent - 1; i++) {
            indentation += '  ';
        }
        indentation += '> ';
    }

    if (term instanceof SyntaxComposedTerm) {
        printLine(indentation, '[Composed]', (<SyntaxComposedTerm>term)._value);
        (<SyntaxComposedTerm>term).children.map(child => printTerm(child, indent + 1));
    }
    else if (term instanceof SyntaxAtomicTerm) {
        if (term instanceof SyntaxLiteral) {
            printLine(indentation, '[Literal]', (<SyntaxLiteral>term)._value);
        }
        else if (term instanceof SyntaxKeyword) {
            printLine(indentation, '[Keyword]', (<SyntaxKeyword>term)._value);
        }
        else if (term instanceof SyntaxDataType) {
            printLine(indentation, '[DataType]', (<SyntaxLiteral>term)._value);
        }
        else if (term instanceof SyntaxMethod) {
            printLine(indentation, '[Method]', (<SyntaxLiteral>term)._value);
            if ((<SyntaxMethod>term).params) {
                printTerm((<SyntaxMethod>term).params, indent + 1)
            }
        }
        else if (term instanceof SyntaxBrackets) {
            printLine(indentation, 'BRACKETS', (<SyntaxLiteral>term)._value);
            printTerm((<SyntaxBrackets>term).content, indent + 1);
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
