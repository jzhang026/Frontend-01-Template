# 每周总结可以写在这里

## HTML PARSER

#### 我们用 FSM 来解析 HTML，最后生成一个 DOM 树，并且计算 CSS 添加到 DOM 树上。

##### 在 weinter 代码的基础上实现了 css 复合选择器

1. 在构建 dom 树的时候，为元素添加氟元素指针`parent`
2. 每个元素有个属性`nthChild`来记录自己是父元素的第几个 child

- 子选择器 `>`
  - 我们可以把诸如 body div > p 看成两段 [body div] 和 [p]，然后用下面的`match`函数去递归的匹配这两段
- 相邻兄弟选择器 `+`
  - 道理同上 body div + p 看成两段 [body div] 和 [p]，然后用下面的`match`函数去递归的匹配
- 通用兄弟选择器 `~`
  - - 道理同上 body div ~ p 看成两段 [body div] 和 [p]，然后用下面的`match`函数去递归的匹配

```javascript
function match(element, selectors) {
  if (!element || selectors.length === 0) return false;
  let currentElement = element;

  let i = selectors.length - 1;
  let currentSelector = selectors[i];

  while (i >= 0 && currentElement) {
    let currentElementParent = currentElement.parent;
    let immediaSiblings = currentElementParent.children.filter(
      (element) => element.tagName
    );
    switch (currentSelector) {
      // 子选择器
      case '>':
        return match(currentElementParent, selectors.slice(0, i));

      case '~':
        return immediaSiblings
          .slice(0, currentElement.nthChild)
          .some((element) => match(element, selectors.slice(0, i)));

      case '+':
        return match(
          immediaSiblings[currentElement.nthChild - 1],
          selectors.slice(0, i)
        );
      default:
        const type = currentSelector.charAt(0);
        let attribute;
        switch (type) {
          case '#':
            attribute = currentElement.attributes.find(
              (attr) => attr.name === 'id'
            );
            if (
              attribute &&
              attribute.value === currentSelector.replace('#', '')
            )
              currentSelector = selectors[--i];
            break;
          case '.':
            attribute = currentElement.attributes.find(
              (attr) => attr.name === 'class'
            );
            if (
              attribute &&
              attribute.value === currentSelector.replace('.', '')
            )
              currentSelector = selectors[--i];
            break;
          default:
            if (currentElement.tagName == currentSelector)
              currentSelector = selectors[--i];
        }
        if (i === selectors.length - 1) return false;
        if (!['<', '~', '+'].includes(currentSelector)) {
          currentElement = currentElement.parent;
        }
    }
  }
  if (i < 0) return true;
  return false;
}
function computeCss(element, stack) {
  const parents = stack.slice().reverse();
  element.computedStyle = element.computedStyle || {};
  for (const rule of rules) {
    // 为了支持复合选择器，这里的match方法我重写了
    if (match(element, rule.selectors[0].split(' '))) {
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
```

最后生成得到的 DOM 树

```json
{
  "type": "document",
  "children": [
    {
      "type": "element",
      "children": [
        {
          "type": "text",
          "content": "\n  "
        },
        {
          "type": "element",
          "children": [
            {
              "type": "text",
              "content": "\n      "
            },
            {
              "type": "element",
              "children": [
                {
                  "type": "text",
                  "content": "\n  body div #myid{\n      width:100px;\n      background-color: #ff5000;\n  }\n  body div img{\n      width:30px;\n      background-color: #ff1111;\n  }\n      "
                }
              ],
              "attributes": [],
              "tagName": "style",
              "parent": "head",
              "computedStyle": {}
            },
            {
              "type": "text",
              "content": "\n  "
            }
          ],
          "attributes": [],
          "tagName": "head",
          "parent": "html",
          "computedStyle": {}
        },
        {
          "type": "text",
          "content": "\n  "
        },
        {
          "type": "element",
          "children": [
            {
              "type": "text",
              "content": "\n      "
            },
            {
              "type": "element",
              "children": [
                {
                  "type": "text",
                  "content": "\n          "
                },
                {
                  "type": "element",
                  "children": [],
                  "attributes": [
                    {
                      "name": "id",
                      "value": "myid"
                    }
                  ],
                  "tagName": "img",
                  "parent": "div",
                  "computedStyle": {
                    "width": {
                      "value": "100px",
                      "specificity": [0, 1, 0, 2]
                    },
                    "background-color": {
                      "value": "#ff5000",
                      "specificity": [0, 1, 0, 2]
                    }
                  }
                },
                {
                  "type": "text",
                  "content": "\n          "
                },
                {
                  "type": "element",
                  "children": [],
                  "attributes": [],
                  "tagName": "img",
                  "parent": "div",
                  "computedStyle": {
                    "width": {
                      "value": "30px",
                      "specificity": [0, 0, 0, 3]
                    },
                    "background-color": {
                      "value": "#ff1111",
                      "specificity": [0, 0, 0, 3]
                    }
                  }
                },
                {
                  "type": "text",
                  "content": "\n      "
                }
              ],
              "attributes": [],
              "tagName": "div",
              "parent": "body",
              "computedStyle": {}
            },
            {
              "type": "text",
              "content": "\n  "
            }
          ],
          "attributes": [],
          "tagName": "body",
          "parent": "html",
          "computedStyle": {}
        },
        {
          "type": "text",
          "content": "\n  "
        }
      ],
      "attributes": [
        {
          "name": "maaa",
          "value": "a"
        }
      ],
      "tagName": "html",
      "computedStyle": {}
    }
  ]
}
```

### 有限状态机处理字符串

- 每一个状态都是一个机器
  - 在每一个机器里，我们可以做单独的逻辑
  - 所有的这些机器接受的输入是一致的
  - 每一个机器本身是没有状态的。它应该是一个纯函数，无副作用
- 每一个机器知道下一个状态
  - 每个机器都有确定的下一个状态（Moore）
  - 每个机器根据输入决定下一个状态（Mealy）
- 我们一般用的都是 mealy 类型的状态机

#### str 中找 a

```javascript
function findA(str) {
  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);
    if (char === 'a') return i;
  }
  return -1;
}
```

#### str 中找`ab`

```javascript
```

#### str 中找到`abcdef`

```javascript
function match(str) {
  return sub_match(str, 'abcdef');
}
function sub_match(str, pattern) {
  if (str.length < pattern.length) return false;
  let i = 0;
  for (; i < pattern.length; i++) {
    if (str.charAt(i) !== pattern.charAt(i)) break;
  }
  if (i === pattern.length) return true;
  return sub_match(str.slice(1), pattern);
}
```

```javascript
function match(string) {
  let state = start;
  for (let c of string) {
    state = state(c);
  }
  return state === end;
}

function start(c) {
  if (c === 'a') {
    return foundA;
  } else {
    return start;
  }
}
// track, 作为最终状态
function end(c) {
  return end;
}
function foundA(c) {
  if (c === 'b') {
    return foundB;
  } else {
    return start;
  }
}
function foundB(c) {
  if (c === 'c') {
    return foundC;
  } else {
    return start;
  }
}
function foundC(c) {
  if (c === 'd') {
    return foundD;
  } else {
    return start;
  }
}
function foundD(c) {
  if (c === 'e') {
    return foundE;
  } else {
    return start;
  }
}
function foundE(c) {
  if (c === 'e') {
    return foundE;
  } else {
    return start;
  }
}
function foundF(c) {
  if (c === 'f') {
    return end;
  } else {
    return start;
  }
}
```
