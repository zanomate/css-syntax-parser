# Css Syntax Parser

A simple parser for MDN's ["CSS value definition syntax"](https://developer.mozilla.org/en-US/docs/Web/CSS/Value_definition_syntax).

```js
let resolveSyntax = require('css-syntax-parser');

const syntax = resolveSyntax('[ <length> | <percentage> | auto ]{1,4}');

console.log(syntax.type); // brackets
console.log(syntax.multiplier); // range
console.log(syntax.range.min); // 1 
console.log(syntax.range.max); // 4

let content = syntax.multiplier.content;
console.log(content.type); // composed 
console.log(content.combinator); // |

let child1 = content.children[1]; 
console.log(child1.type); // data-type
console.log(child1.name); // percentage
console.log(child1.nonTerminal); // false
```
