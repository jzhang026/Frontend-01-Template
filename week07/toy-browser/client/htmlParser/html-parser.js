const { computeCss, addCSSRules } = require('./css-compute');
const layout = require('./layout.js');
const EOF = Symbol('EOF');

let currentState = null;
let currentToken = null;
let currentAttributeName = null;
let currentAttributeValue = null;
let currentTextNode = null;
let stack = [{ type: 'document', children: [], childLength: 0 }];
const TOKEN_TYPE = {
  TEXT: 'text',
  START_TAG: 'startTag',
  END_TAG: 'endTag',
  END_OF_FILE: EOF,
};

module.exports.TOKEN_TYPE = TOKEN_TYPE;
const nameOtherThanAttribute = ['type', 'tagName', 'isSelfClosing'];

module.exports.emit = function emit(token) {
  let top = stack[stack.length - 1];
  switch (token.type) {
    case TOKEN_TYPE.START_TAG:
      const element = {
        type: 'element',
        children: [],
        childLength: 0,
        attributes: Object.keys(token)
          .filter((key) => !nameOtherThanAttribute.includes(key))
          .map((key) => ({
            name: key,
            value: token[key],
          })),
        tagName: token.tagName,
        parent: top,
        nthChild: top.childLength++,
      };
      computeCss(element, stack);
      top.children.push(element);
      !token.isSelfClosing && stack.push(element);
      currentTextNode = null;
      break;

    case TOKEN_TYPE.END_TAG:
      if (top.tagName != token.tagName) {
        throw new Error(
          `<${top.tagName}> and </${token.tagName}> is not match`
        );
      }
      if (token.tagName === 'style') {
        addCSSRules(top.children[0].content);
      }
      layout(top);
      stack.pop();
      currentTextNode = null;
      break;
    case TOKEN_TYPE.TEXT:
      if (!currentTextNode) {
        top.children.push(
          (currentTextNode = currentTextNode || {
            type: TOKEN_TYPE.TEXT,
            content: '',
          })
        );
      }
      currentTextNode.content += token.content;
      break;
    case TOKEN_TYPE.END_OF_FILE:
      break;
    default:
      console.warn('an unknown token emitted\n', token);
  }
};

module.exports.parseHTML = function parseHTML(html) {
  let state = require('./state-functions').data;

  for (let c of html) {
    currentState = state;
    state = state(c);
  }
  state = state(EOF);

  return stack[0];
};
