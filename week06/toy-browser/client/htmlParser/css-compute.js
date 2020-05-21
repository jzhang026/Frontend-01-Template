const css = require('css');

let rules = [];
function addCSSRules(text) {
  const ast = css.parse(text);
  rules.push(...ast.stylesheet.rules);
}
function specificity(selectorStr) {
  const weight = [0, 0, 0, 0];
  const selectors = selectorStr.split(' ');
  for (let selector of selectors) {
    const type = selector.charAt(0);
    switch (type) {
      case '#':
        weight[1] += 1;
        break;
      case '.':
        weight[2] += 1;
        break;
      default:
        weight[3] += 1;
    }
  }
  return weight;
}
function compare(existing, current) {
  const length = Math.min(existing.length, current.length);
  let i = 0;
  while (i < length) {
    if (existing[i] - current[i]) {
      return existing[i] - current[i];
    }
    i++;
  }
  return 0;
}
function match(element, selector) {
  if (!element || !selector) return false;
  const type = selector.charAt(0);
  let attribute;
  switch (type) {
    case '#':
      attribute = element.attributes.find((attr) => attr.name === 'id');
      if (attribute && attribute.value === selector.replace('#', ''))
        return true;
      break;
    case '.':
      attribute = element.attributes.find((attr) => attr.name === 'class');
      if (attribute && attribute.value === selector.replace('.', ''))
        return true;
      break;
    default:
      if (element.tagName === selector) return true;
  }
  return false;
}
function computeCss(element, stack) {
  const parents = stack.slice().reverse();
  element.computedStyle = element.computedStyle || {};
  for (const rule of rules) {
    const selectors = rule.selectors[0].split(' ').reverse();
    if (!match(element, selectors[0])) continue;
    let j = 1;
    for (let i = 0; i < parents.length; i++) {
      if ((match(parents[i]), selectors[j])) j++;
    }
    if (j === selectors.length) {
      const weight = specificity(rule.selectors[0]);
      const computedStyle = element.computedStyle;
      for (let declaration of rule.declarations) {
        let properties = computedStyle[declaration.property] || {};
        computedStyle[declaration.property] = properties;
        if (
          !properties.specificity ||
          compare(properties.specificity, weight) <= 0
        ) {
          properties.value = declaration.value;
          properties.specificity = weight;
        }
      }
    }
  }
}
module.exports = { computeCss, addCSSRules };
