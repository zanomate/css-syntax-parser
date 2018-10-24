export function makeMask(length: number) {
    return new Array(length).fill('_').join('')
}

const illegalCharacter = ['|', '&'];

export function allIndexes(predicate: string, search: RegExp) {
    let indexes: number[] = [];
    let lastIndex = 0;
    let match;

    while ((match = search.exec(predicate.substring(lastIndex))) !== null) {
        let index = lastIndex + match.index;
        let length = match[0].length;
        lastIndex = index + 1;

        if (index > 0 && illegalCharacter.includes(predicate.charAt(index - 1))) {
            continue;
        }
        if (index < predicate.length - 1 && illegalCharacter.includes(predicate.charAt(index + length))) {
            continue;
        }

        indexes.push(index);
    }

    return indexes;
}

export function findEnd(predicate: string, start: number, bracketOpen: string, bracketClose: string): number {
    let pred = predicate.substr(start);
    if (!pred.startsWith(bracketOpen)) {
        throw new Error('malformed predicate: ' + pred);
    }
    let bracketsToClose: number = 1;
    let lastBracket = 0;
    while (bracketsToClose) {
        let nextClose = pred.indexOf(bracketClose, lastBracket + 1);
        if (nextClose == -1) {
            throw new Error('malformed predicate: ' + pred);
        }

        let nextOpen = (bracketOpen !== bracketClose) ? pred.indexOf(bracketOpen, lastBracket + 1) : -1;
        if (nextOpen == -1 || nextOpen > nextClose) {
            bracketsToClose--;
            lastBracket = nextClose;
        }
        else {
            bracketsToClose++;
            lastBracket = nextOpen;
        }
    }
    return start + lastBracket;
}

export function mask(predicate: string, open: string, close: string): string {
    let start;
    let last = 0;
    while ((start = predicate.indexOf(open, last)) >= 0) {
        const end = findEnd(predicate, start, open, close);
        predicate = predicate.substr(0, start + 1) + makeMask(end - start - 1) + predicate.substr(end);
        last = end + 1;
    }
    return predicate;
}

export function indent(indentation: number) {
    if(!indentation) {
        return "";
    }
    return new Array(indentation).fill('.  ').join('');
}
