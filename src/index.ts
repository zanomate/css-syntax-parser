export * from './model';
export * from './controller';

import { Resolver } from './controller';
import { MDN } from './data';
import { Term } from './model';

export function resolveSyntaxByName(propertyName: string, recursive: boolean = false): Term {
    const syntax = MDN.Properties[propertyName];
    if (!syntax) {
        throw new Error(`Error: unknown property '${propertyName}'`);
    }
    return resolveSyntax(MDN.Properties[propertyName], recursive);
}

export function resolveSyntax(syntax: string, recursive: boolean = false): Term {
    try {
        return new Resolver(recursive).resolve(syntax);
    }
    catch (e) {
        console.error('Error:', e.message);
    }
}

export default resolveSyntax;
