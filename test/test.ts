import resolveSyntax, { resolveSyntaxByName } from '../src';

console.log('\n\nresolveSyntax\n');
const syntax = 'step-start | step-end | steps(<integer>[, [ start | end ] ]?)';
resolveSyntax(syntax, false).print();

console.log('\n\nresolveSyntaxByName\n');
const propertyName = 'grid';
resolveSyntaxByName(propertyName).print();
