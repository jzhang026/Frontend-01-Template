#### 编写一个 match 函数，完善你的 toy-browser

你可以将下面这份代码贴到任意一个网页的控制台。
然后 `match(selectors, domElement)` 来调用。

##### 这里的 `selectors` 支持:

1. 复合选择器`~`, `+`, `>`
2. 复杂选择器，比如 `div + #my-id.my-class.another-class[name=value]`

```javascript
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

// match function
function match(selector, element) {
  const selectors = selector.split(' ');
  if (!element || selectors.length === 0) return false;
  let currentElement = element;
  let i = selectors.length - 1;
  let currentSelector = selectors[i];

  // this is used to parse complex selecors
  // such as 'div#my-id.my-class[foo=bar]
  let complexParser = new ParseComplexSelector();
  while (i >= 0 && currentElement) {
    let currentElementParent = currentElement.parentElement;
    let tempElement = null;
    switch (currentSelector) {
      case '>':
        return match(selectors.slice(0, i).join(' '), currentElementParent);

      case '~':
        tempElement = currentElement.previousElementSibling;
        while (tempElement !== null) {
          if (match(selectors.slice(0, i).join(' '), tempElement)) return true;
          tempElement = tempElement.previousElementSibling;
        }
        return false;

      case '+':
        tempElement = currentElement.previousElementSibling;
        if (match(selectors.slice(0, i).join(' '), tempElement)) return true;
        return false;

      default:
        const parsedSelectors = complexParser.parse(currentSelector);
        for (let selectorType in parsedSelectors) {
          if (
            selectorType === 'id' &&
            currentElement.getAttribute('id') === parsedSelectors.id
          )
            continue;
          else if (selectorType === 'attributes') {
            let attributes = Object.keys(parsedSelectors.attributes);
            let isAttributesMatch = attributes.every(
              (attr) =>
                parsedSelectors.attributes[attr] ===
                currentElement.getAttribute(attr)
            );
            if (!isAttributesMatch) return false;
          } else if (selectorType === 'class') {
            let domClass = currentElement.getAttribute('class');
            let classList = domClass ? domClass.split(' ') : [];
            let isClassMatch = parsedSelectors.class.every((cls) =>
              classList.includes(cls)
            );
            if (!isClassMatch) return false;
          } else if (selectorType === 'tag') {
            let isTagNameMatch =
              parsedSelectors.tag.toUpperCase() ===
              currentElement.tagName.toUpperCase();
            if (!isTagNameMatch) return false;
          }
        }

        currentSelector = selectors[--i];
        if (!['>', '~', '+'].includes(currentSelector)) {
          currentElement = currentElement.parentElement;
        }
    }
  }
  if (i < 0) return true;
  return false;
}
```
