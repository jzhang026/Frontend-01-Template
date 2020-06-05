const { ParseComplexSelector } = require('./parseComplexSelector');

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
        let numberOfTypes = Object.keys(parsedSelectors).length;
        for (let selectorType in parsedSelectors) {
          let isMatched = false;
          switch (selectorType) {
            case 'id':
              isMatched =
                currentElement.getAttribute('id') !== parsedSelectors.id;
              break;

            case 'attributes':
              let attributes = Object.keys(parsedSelectors.attributes);
              isMatched = attributes.every(
                (attr) =>
                  parsedSelectors.attributes[attr] ===
                  currentElement.getAttribute(attr)
              );
              break;

            case 'class':
              let domClass = currentElement.getAttribute('class');
              let classList = domClass ? domClass.split(' ') : [];
              isMatched = parsedSelectors.class.every((cls) =>
                classList.includes(cls)
              );
              break;

            case 'tag':
              isMatched =
                parsedSelectors.tag.toUpperCase() ===
                currentElement.tagName.toUpperCase();
          }
          if (!isMatched) break;
          numberOfTypes--;
        }

        if (numberOfTypes === 0) currentSelector = selectors[--i];
        if (!['>', '~', '+'].includes(currentSelector)) {
          currentElement = currentElement.parentElement;
        }
    }
  }
  if (i < 0) return true;
  return false;
}
