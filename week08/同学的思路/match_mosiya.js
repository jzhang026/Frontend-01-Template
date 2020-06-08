function isSimpleSelectorMatched(selector, element) {
  let attr;
  if (selector.charAt() === '#') {
    attr = element.id;
    return attr && attr === selector.slice(1);
  } else if (selector.charAt() === '.') {
    attr = [].slice.call(element.classList);
    return attr && attr.indexOf(selector.slice(1)) !== -1;
  } else {
    return element.tagName.toLowerCase() === selector;
  }
}
// 决定是否要返回该元素
function getCompoundSelectorMatchedElement(selector, element) {
  // 9表示该元素是文档节点
  if (!element || element.nodeType === 9) return null;
  let selectors = selector.split(/(?=[.#])/);
  return selectors.every((item) => isSimpleSelectorMatched(item, element))
    ? element
    : null;
}

function removeExtraSpace(selector) {
  return selector.replace(/\s*([>+~])\s*/g, '$1').replace(/\s+/g, ' ');
}

function getComplexSelectorMatchedElement(selectors, element) {
  let selector = selectors.pop();
  if (![' ', '~', '+', '>'].includes(selector)) {
    element = getCompoundSelectorMatchedElement(selector, element);
  } else {
    switch (combinator) {
      case ' ':
        element = element.parentNode;
        while (
          element &&
          !(element = getComplexSelectorMatchedElement(selectors, element))
        )
          element = element.parentNode;
        break;
      case '>':
        element = element.parentNode;
        if (element)
          element = getComplexSelectorMatchedElement(selectors, element);
        break;
      case '~':
        element = element.previousElementSibling;
        while (
          element &&
          !(element = getComplexSelectorMatchedElement(selectors, element))
        )
          element = element.previousElementSibling;
        break;
      case '+':
        element = element.previousElementSibling;
        if (element)
          element = getComplexSelectorMatchedElement(selectors, element);
        break;
    }
  }
  return element;
}

function isMatched(selector, element) {
  if (!selector || !element) return false;
  selector = removeExtraSpace(selector);
  let selectors = selector.split(/(?=[ >~+])|(?<=[[ >~+])/g);

  return !!getComplexSelectorMatchedElement(selectors, element);
}
