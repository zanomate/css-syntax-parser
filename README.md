# Css Syntax Parser

A simple parser for MDN's ["CSS value definition syntax"](https://developer.mozilla.org/en-US/docs/Web/CSS/Value_definition_syntax).

```js
let resolveSyntax = require('css-syntax-parser');

const syntax = resolveSyntax('[ <length> | <percentage> | auto ]{1,4}');

syntax.print();
// [
// .  COMPOSED
// .  -combinator: |
// .  .  DATA TYPE
// .  .  -name: length
// .  .  -non-terminal: false
// .  .
// .  .  DATA TYPE
// .  .  -name: percentage
// .  .  -non-terminal: false
// .  .
// .  .  KEYWORD
// .  .  -value: auto
// .  .
// ]
// -multiplier: {range}
// -range: { min: 1, max: 4 }

console.log(syntax.type); // brackets
console.log(syntax.multiplier); // {range}
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

## Methods

| Method |
| --- |
| `resolveSyntax(syntax, recursive?)` |
| `resolveSyntaxByName(propertyName, recursive?)` |

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

## Recursive resolve

```js
let { resolveSyntaxByName } = require('css-syntax-parser');

const syntax = resolveSyntaxByName('grid', true);

syntax.print();

// COMPOSED
// -combinator: |
// .  [
// .  .  COMPOSED
// .  .  -combinator: |
// .  .  .  KEYWORD
// .  .  .  -value: none
// .  .  .  
// .  .  .  [
// .  .  .  .  COMPOSED
// .  .  .  .  -combinator:  
// .  .  .  .  .  [
// .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  -combinator: |
// .  .  .  .  .  .  .  KEYWORD
// .  .  .  .  .  .  .  -value: none
// .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  .  .  .  .  .  .  .  STRING
// .  .  .  .  .  .  .  .  .  .  .  .  .  -value: [
// .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  -name: custom-ident
// .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  -multiplier: *
// .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  STRING
// .  .  .  .  .  .  .  .  .  .  .  .  .  -value: ]
// .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  -multiplier: ?
// .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  -combinator: |
// .  .  .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  -combinator: |
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -combinator: |
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -combinator: |
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: length
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: percentage
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: flex
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  KEYWORD
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -value: min-content
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  KEYWORD
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -value: max-content
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  KEYWORD
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -value: auto
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  METHOD
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name minmax
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  (
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -combinator: |
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: length
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: percentage
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  KEYWORD
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -value: min-content
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  KEYWORD
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -value: max-content
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  KEYWORD
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -value: auto
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  LITERAL
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -value: ,
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: track-breadth
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  )
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  METHOD
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name fit-content
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  (
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -combinator: |
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: length
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: percentage
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  )
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  METHOD
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name repeat
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  (
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: positive-integer
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  LITERAL
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -value: ,
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: line-names
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -multiplier: ?
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: track-size
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -multiplier: +
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: line-names
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -multiplier: ?
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  )
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  -multiplier: +
// .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  -name: line-names
// .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  -multiplier: ?
// .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  -name: line-names
// .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  -multiplier: ?
// .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  -combinator: |
// .  .  .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  -combinator: |
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: length-percentage
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  METHOD
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name minmax
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  (
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: fixed-breadth
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  LITERAL
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -value: ,
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: track-breadth
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  )
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  METHOD
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name minmax
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  (
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: inflexible-breadth
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  LITERAL
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -value: ,
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: fixed-breadth
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  )
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  METHOD
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name repeat
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  (
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: positive-integer
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  LITERAL
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -value: ,
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: line-names
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -multiplier: ?
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: fixed-size
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -multiplier: +
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: line-names
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  -multiplier: ?
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  )
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  -multiplier: *
// .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  -name: line-names
// .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  -multiplier: ?
// .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  METHOD
// .  .  .  .  .  .  .  .  .  .  -name repeat
// .  .  .  .  .  .  .  .  .  .  (
// .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  .  -combinator: |
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  KEYWORD
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  -value: auto-fill
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  KEYWORD
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  -value: auto-fit
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  LITERAL
// .  .  .  .  .  .  .  .  .  .  .  .  -value: ,
// .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: line-names
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  -multiplier: ?
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  -name: fixed-size
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  .  -multiplier: +
// .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  -name: line-names
// .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  -multiplier: ?
// .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  )
// .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  -name: line-names
// .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  -multiplier: ?
// .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  .  .  .  -combinator: |
// .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  -name: fixed-size
// .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  .  .  .  -name: fixed-repeat
// .  .  .  .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  .  -multiplier: *
// .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  -name: line-names
// .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  -multiplier: ?
// .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  
// .  .  .  .  .  ]
// .  .  .  .  .  
// .  .  .  .  .  LITERAL
// .  .  .  .  .  -value: /
// .  .  .  .  .  
// .  .  .  .  .  [
// .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  -combinator: |
// .  .  .  .  .  .  .  KEYWORD
// .  .  .  .  .  .  .  -value: none
// .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  -name: track-list
// .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  -name: auto-track-list
// .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  
// .  .  .  .  .  ]
// .  .  .  .  .  
// .  .  .  ]
// .  .  .  
// .  .  .  COMPOSED
// .  .  .  -combinator:  
// .  .  .  .  [
// .  .  .  .  .  COMPOSED
// .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  -name: line-names
// .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  -multiplier: ?
// .  .  .  .  .  .  
// .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  -name: string
// .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  
// .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  -name: track-size
// .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  -multiplier: ?
// .  .  .  .  .  .  
// .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  -name: line-names
// .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  -multiplier: ?
// .  .  .  .  .  .  
// .  .  .  .  ]
// .  .  .  .  -multiplier: +
// .  .  .  .  
// .  .  .  .  [
// .  .  .  .  .  COMPOSED
// .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  LITERAL
// .  .  .  .  .  .  -value: /
// .  .  .  .  .  .  
// .  .  .  .  .  .  [
// .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  .  .  [
// .  .  .  .  .  .  .  .  .  COMPOSED
// .  .  .  .  .  .  .  .  .  -combinator:  
// .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  -name: line-names
// .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  -multiplier: ?
// .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  .  .  -name: track-size
// .  .  .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  ]
// .  .  .  .  .  .  .  .  -multiplier: +
// .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  .  .  DATA TYPE
// .  .  .  .  .  .  .  .  -name: line-names
// .  .  .  .  .  .  .  .  -non-terminal: false
// .  .  .  .  .  .  .  .  -multiplier: ?
// .  .  .  .  .  .  .  .  
// .  .  .  .  .  .  ]
// .  .  .  .  .  .  
// .  .  .  .  ]
// .  .  .  .  -multiplier: ?
// .  .  .  .  
// .  ]
// .  
// .  COMPOSED
// .  -combinator:  
// .  .  DATA TYPE
// .  .  -name: grid-template-rows
// .  .  -non-terminal: true
// .  .  
// .  .  LITERAL
// .  .  -value: /
// .  .  
// .  .  [
// .  .  .  COMPOSED
// .  .  .  -combinator: &&
// .  .  .  .  KEYWORD
// .  .  .  .  -value: auto-flow
// .  .  .  .  
// .  .  .  .  KEYWORD
// .  .  .  .  -value: dense
// .  .  .  .  -multiplier: ?
// .  .  .  .  
// .  .  ]
// .  .  
// .  .  [
// .  .  .  DATA TYPE
// .  .  .  -name: track-size
// .  .  .  -non-terminal: false
// .  .  .  -multiplier: +
// .  .  .  
// .  .  ]
// .  .  -multiplier: ?
// .  .  
// .  COMPOSED
// .  -combinator:  
// .  .  [
// .  .  .  COMPOSED
// .  .  .  -combinator: &&
// .  .  .  .  KEYWORD
// .  .  .  .  -value: auto-flow
// .  .  .  .  
// .  .  .  .  KEYWORD
// .  .  .  .  -value: dense
// .  .  .  .  -multiplier: ?
// .  .  .  .  
// .  .  ]
// .  .  
// .  .  [
// .  .  .  DATA TYPE
// .  .  .  -name: track-size
// .  .  .  -non-terminal: false
// .  .  .  -multiplier: +
// .  .  .  
// .  .  ]
// .  .  -multiplier: ?
// .  .  
// .  .  LITERAL
// .  .  -value: /
// .  .  
// .  .  DATA TYPE
// .  .  -name: grid-template-columns
// .  .  -non-terminal: true
// .  .  
```
