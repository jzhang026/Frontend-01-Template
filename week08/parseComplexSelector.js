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
    this.afterQuptedAttributeValue = this.afterQuptedAttributeValue.bind(this);
    this.unquotedAttributeValueState = this.unquotedAttributeValueState.bind(
      this
    );
    this.waitEqualSignForAttributeValueList = this.waitEqualSignForAttributeValueList.bind(
      this
    );
    this.doubleQuotedValueState = this.doubleQuotedValueState.bind(this);
    this.singleQuotedValueState = this.singleQuotedValueState.bind(this);
    this.waitingCaseSensitiveFlag = this.waitingCaseSensitiveFlag.bind(this);
    this.afterCaseSensitiveFlag = this.afterCaseSensitiveFlag.bind(this);
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
        let currentAttributePair = this.selector.attributes[this.attributeName];
        let isCaseInsensitive = currentAttributePair.isCaseInsensitive;
        switch (currentAttributePair.type) {
          case 'valueList':
            currentAttributePair.value = this.attributeValue.split(' ');
            if (isCaseInsensitive) {
              currentAttributePair.value = currentAttributePair.value.map(
                (ele) => ele.toLowerCase()
              );
            }
            break;
          case 'exactlyValue':
          case 'valuePrefix':
          case 'valueSuffix':
          case 'valueSuffix':
          case 'valueIncluds':
          case 'valueSubMatch':
            currentAttributePair.value = isCaseInsensitive
              ? this.attributeValue.toLowerCase()
              : this.attributeValue;
            break;
        }

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
    this.selector.attributes = this.selector.attributes || {};
    let currentAttribute = (this.selector.attributes[this.attributeName] = {});
    switch (c) {
      case '=':
        currentAttribute.type = 'exactlyValue';
        return this.attributeValueState;
      case '~':
        currentAttribute.type = 'valueList';
        return this.waitEqualSignForAttributeValueList;
      case '|':
        currentAttribute.type = 'valueSubMatch';
        return this.waitEqualSignForAttributeValueList;
      case '^':
        currentAttribute.type = 'valuePrefix';
        return this.waitEqualSignForAttributeValueList;
      case '$':
        currentAttribute.type = 'valueSuffix';
        return this.waitEqualSignForAttributeValueList;
      case '*':
        currentAttribute.type = 'valueIncluds';
        return this.waitEqualSignForAttributeValueList;
      case this.EOF:
      default:
        throw new Error('some errors in your selector');
    }
  }
  waitEqualSignForAttributeValueList(c) {
    if (c === '=') return this.attributeValueState;
    else throw new Error('some errors in your selector');
  }

  attributeValueState(c) {
    if (c.match && c.match(/^[a-zA-Z0-9\-_]$/)) {
      return this.unquotedAttributeValueState(c);
    }
    switch (c) {
      case ']':
        this.emit({
          type: 'attribute',
        });
        return this.dataState;
      case '\u0022': // quotation mark "
        return this.doubleQuotedValueState;
      case '\u0027': // quotation mark "
        return this.singleQuotedValueState;
      case this.EOF:
      default:
        throw new Error('some errors in your selector');
    }
  }
  unquotedAttributeValueState(c) {
    if (c.match && c.match(/^[a-zA-Z0-9\-_]$/)) {
      this.attributeValue += c;
      return this.unquotedAttributeValueState;
    }
    switch (c) {
      case ']':
        this.emit({
          type: 'attribute',
        });
        return this.dataState;
      case ' ':
        return this.waitingCaseSensitiveFlag;
      case this.EOF:
      default:
        throw new Error('some errors in your selector');
    }
  }
  waitingCaseSensitiveFlag(c) {
    if (c === ' ') return this.waitingCaseSensitiveFlag;

    this.selector.attributes = this.selector.attributes || {};
    let currentAttributePair = this.selector.attributes[this.attributeName];
    switch (c) {
      case 'i':
        currentAttributePair.isCaseInsensitive = true;
        return this.afterCaseSensitiveFlag;
      case this.EOF:
      default:
        throw new Error('some errors in your selector');
    }
  }
  afterCaseSensitiveFlag(c) {
    switch (c) {
      case ' ':
        return this.afterCaseSensitiveFlag;
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
  doubleQuotedValueState(c) {
    if (c.match && c.match(/^[a-zA-Z0-9\-_\s]$/)) {
      this.attributeValue += c;
      return this.doubleQuotedValueState;
    }
    switch (c) {
      case '\u0022': // quotation mark "
        return this.afterQuptedAttributeValue;
      case this.EOF:
      default:
        throw new Error('some errors in your selector');
    }
  }
  singleQuotedValueState(c) {
    if (c.match && c.match(/^[a-zA-Z0-9\-_\s]$/)) {
      this.attributeValue += c;
      return this.singleQuotedValueState;
    }
    switch (c) {
      case '\u0027': // apostrophe (')
        return this.afterQuptedAttributeValue;
      case this.EOF:
      default:
        throw new Error('some errors in your selector');
    }
  }
  afterQuptedAttributeValue(c) {
    if (c === ']') {
      this.emit({
        type: 'attribute',
      });
      return this.dataState;
    } else {
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
