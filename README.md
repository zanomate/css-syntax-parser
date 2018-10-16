# Css Syntax Parser

A simple parser for MDN's ["CSS value definition syntax"](https://developer.mozilla.org/en-US/docs/Web/CSS/Value_definition_syntax).

```js
let resolveSyntax = require('css-syntax-parser');

const syntax = resolveSyntax('[ <length> | <percentage> | auto ]{1,4}');

console.log(syntax.type); // brackets
console.log(syntax.multiplier); // range
console.log(syntax.range.min); // 1 
console.log(syntax.range.max); // 4

let content = syntax.content;
console.log(content.type); // composed 
console.log(content.combinator); // |

let child1 = content.children[1]; 
console.log(child1.type); // data-type
console.log(child1.name); // percentage
console.log(child1.nonTerminal); // false
```

in Typescript: 

```typescript
import {
    resolveSyntax,
    BracketsTerm,
    ComposedTerm,
    DataTypeTerm,
    Term,
    TermMultiplier,
    TermType
} from 'css-syntax-parser';

const syntax: Term = resolveSyntax('[ <length> | <percentage> | auto ]{1,4}');

console.log(syntax.type); // brackets

if (syntax.type === TermType.BRACKETS) {

    const brackets: BracketsTerm = <BracketsTerm>syntax;

    if (brackets.multiplier === TermMultiplier.RANGE) {

        console.log(brackets.multiplier); // range
        console.log(brackets.range.min); // 1
        console.log(brackets.range.max); // 4
    }

    if (brackets.content.type === TermType.COMPOSED) {

        const content: ComposedTerm = <ComposedTerm>brackets.content;
        console.log(content.type); // composed
        console.log(content.combinator); // exactly one

        if (content.children[1].type === TermType.DATA_TYPE) {

            const child1: DataTypeTerm = <DataTypeTerm>content.children[1];
            console.log(child1.type); // data-type
            console.log(child1.name); // percentage
            console.log(child1.nonTerminal); // false
        }
    }
}
```

## Terms

| Type | Samples |
| --- | --- |
| `literal` | `/`, `,` |
| `keyword` | `black`, `top`, `none` |
| `method` | `calc( <calc-sum> )`, `repeat( <length-percentage> )` |
| `data-type` | `<calc-sum>`, `<'border-width'>` |
| `composed` | `<attr-name> <type-or-unit>`, `<'border-style'> && <'color'>` |
| `bracket` | `[ <string-token> && <ident-token> ]` |

## Combinators

| Type | Samples |  
| --- | --- |  
| `mandatory exact order` | `value1 value2` |  
| `mandatory any order` | `value1 && value2` |  
| `at least one` | `value1 || value2` |  
| `exactly one` | `value1 | value2` |

## Multipliers

| Type | Samples |  
| --- | --- |  
| `zero or more` | `*` |  
| `one or more` | `+` |  
| `optional` | `?` |  
| `range` | `{1,4}` |
| `array` | `#` |
| `required` | `!` |
