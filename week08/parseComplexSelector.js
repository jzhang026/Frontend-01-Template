// parse complex css selectors, such as 'div#my-id.my-class[foo=bar]'
class ParseComplexSelector {
  constructor() {
    this.selector = {};
    this.name = '';
    this.attributeName = '';
    this.attributeValue = '';
    this.EOF = Symbol('EOF');
    this.dataState = this.dataState.bind(this);
    this.idState = this.idState.bind(this);
    this.classState = this.classState.bind(this);
    this.tagNameState = this.tagNameState.bind(this);
    this.attributeNameState = this.attributeNameState.bind(this);
    this.attributeValueState = this.attributeValueState.bind(this);
  }
  parse(selectorStr) {
    let state = this.dataState;
    for (let c of selectorStr) {
      state = state(c);
    }
    state(this.EOF);
    let res = { ...this.selector };
    this.selector = {};
    return res;
  }
  emit(token) {
    switch (token.type) {
      case 'endIdName':
        this.selector.id = this.name;
        this.name = '';
        break;
      case 'endClassName':
        this.selector.class = this.selector.class || [];
        this.selector.class.push(this.name);
        this.name = '';
        break;
      case 'endTagName':
        this.selector.tag = this.name;
        this.name = '';
        break;
      case 'attribute':
        this.selector.attributes = this.selector.attributes || {};
        this.selector.attributes[this.attributeName] = this.attributeValue;
        this.attributeName = '';
        this.attributeValue = '';
        break;
      default:
        console.log('unknown toke ' + token.type);
    }
  }
  dataState(c) {
    if (c.match && c.match(/^[a-zA-Z0-9\-_]$/)) {
      return this.tagNameState(c);
    }
    switch (c) {
      case '#':
        return this.idState;
      case '.':
        return this.classState;
      case '[':
        return this.attributeNameState;
      case this.EOF:
        return null;
      default:
        throw new Error('some errors in your selector');
    }
  }

  idState(c) {
    if (c.match && c.match(/^[a-zA-Z0-9\-_]$/)) {
      this.name += c;
      return this.idState;
    }
    switch (c) {
      case '#':
      case '.':
      case '[':
      case this.EOF:
        this.emit({
          type: 'endIdName',
        });
        return this.dataState(c);
      default:
        throw new Error('some errors in your selector');
    }
  }

  classState(c) {
    if (c.match && c.match(/^[a-zA-Z0-9\-_]$/)) {
      this.name += c;
      return this.classState;
    }
    switch (c) {
      case '#':
      case '.':
      case '[':
      case this.EOF:
        this.emit({
          type: 'endClassName',
        });
        return this.dataState(c);
      default:
        throw new Error('some errors in your selector');
    }
  }

  tagNameState(c) {
    if (c.match && c.match(/^[a-zA-Z0-9\-_]$/)) {
      this.name += c;
      return this.tagNameState;
    }
    switch (c) {
      case '#':
      case '.':
      case '[':
      case this.EOF:
        this.emit({
          type: 'endTagName',
        });
        return this.dataState(c);
      default:
        throw new Error('some errors in your selector');
    }
  }

  attributeNameState(c) {
    if (c.match && c.match(/^[a-zA-Z0-9\-_]$/)) {
      this.attributeName += c;
      return this.attributeNameState;
    }
    switch (c) {
      case '=':
        return this.attributeValueState;
      case this.EOF:
      default:
        throw new Error('some errors in your selector');
    }
  }
  attributeValueState(c) {
    if (c.match && c.match(/^[a-zA-Z0-9\-_]$/)) {
      this.attributeValue += c;
      return this.attributeValueState;
    }
    switch (c) {
      case ']':
        this.emit({
          type: 'attribute',
        });
        return this.dataState;
      case this.EOF:
      default:
        throw new Error('some errors in your selector');
    }
  }
}

// singleton pattern
function createParseSelector() {
  let parseComplexSelector = null;
  return function () {
    if (parseComplexSelector) return parseComplexSelector;
    return (parseComplexSelector = new ParseComplexSelector());
  };
}
module.exports.getComplexSelectorParser = createParseSelector();
module.exports.ParseComplexSelector = ParseComplexSelector;
