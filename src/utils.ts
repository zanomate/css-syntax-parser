export function makeMask(length: number) {
    let mask = '';
    for (let i = 0; i < length; i++) {
        mask += '_';
    }
    return mask;
}

export const singleBarIndexes = (predicate: string) => allIndexes(predicate, /\|/);
export const doubleBarIndexes = (predicate: string) => allIndexes(predicate, /\|\|/);
export const doubleAmpersandIndexes = (predicate: string) => allIndexes(predicate, /&&/);
export const spacesIndexes = (predicate: string) => allIndexes(predicate, /\s+/);

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
    predicate = predicate.substr(start);
    if (!predicate.startsWith(bracketOpen)) {
        throw new Error('malformed predicate: ' + predicate);
    }
    let bracketsToClose: number = 1;
    let lastBracket = 0;
    while (bracketsToClose) {
        let nextClose = predicate.indexOf(bracketClose, lastBracket + 1);
        if (nextClose == -1) {
            throw new Error('malformed predicate: ' + predicate);
        }

        let nextOpen = predicate.indexOf(bracketOpen, lastBracket + 1);
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
