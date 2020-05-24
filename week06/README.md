# 每周总结可以写在这里

#### 使用有限状态机。来实现 KMP 的思想

原理：

假设我们有

- 主串为 `abababacaba`
- 模式串（pattern）为 `ababaca`
  因为 pattern 的长度为 7，所以我们定义 8 种状态，这 8 种状态就是 0 到 7， 可以理解为状态机在运行过程中匹配到了模式串的第几个字符，就表示第几个状态。

那我们的**状态转移表**为：
| State | a | b | c | Pattern |
| ----- | - | - | - | - |
| 0 | 1 |0 |0 |a|
| 1 | 1| 2 | 0 |b|
| 2 | 3 | 0| 0 |a|
| 3 | 1 | 4 | 0|b|
| 4 | 5 | 0| 0|a|
| 5 | 1 | 4 | 6 |c|
| 6 | 7 | 0| 0| a|
| 7 | 1| 2|0 |状态到这里，说明成功匹配|

对应的状态转移图

![Image of State](https://github.com/jzhang026/Frontend-01-Template/blob/master/week06/images/state-transit.jpg)

有了状态转移表。我们就能很容易的写出状态机模型的字符串匹配。
所以这里的关键就是构建状态转移表。
我们这里只考虑 ascii 码，也就是 codePoint 从 0 到 255 的字符。

戳此访问[[完整代码]](https://github.com/jzhang026/Frontend-01-Template/blob/master/week06/KMP-state-machine/kmp-with-state-machine.js) 以及 [[单元测试]](https://github.com/jzhang026/Frontend-01-Template/blob/master/week06/KMP-state-machine/kmp.test.js)

```javascript
//[请注意]
// 这里的状态机状态（state)是一个数字，表示状态机在运行过程中匹配到了模式串的第几个字符，就表示第几个状态。

function getNextState(pattern, state, currentCharacter) {
  // 如果当前状态下，输入的字符正好是我们模式串的下一个字符，直接将state+1
  // 表示我们可以去和模式串的下一个字符比较了
  if (state < pattern.length && currentCharacter == pattern[state])
    return state + 1;

  // 如果没匹配，那我们就循环的找最长前缀,放入状态转移table
  for (let prefixLength = state - 1; prefixLength > 0; prefixLength--) {
    for (let i = 0; i <= prefixLength; i++) {
      if (pattern[i + 1] !== pattern[prefixLength]) break;
      if (i == prefixLength - 1) return prefixLength;
    }
  }
  return 0;
}

// 构建状态转移table
function computeStateTable(pattern) {
  let stateTable = [];
  for (let state = 0; state < pattern.length + 1; state++) {
    stateTable.push([]);

    // 能够输入的只有255哥字符。所以我们只处理255的长度
    for (let charCode = 0; charCode < 256; charCode++) {
      stateTable[state] = stateTable[state] || [];
      stateTable[state][charCode] = getNextState(
        pattern,
        state,
        String.fromCharCode(charCode)
      );
    }
  }
  return stateTable;
}
// 在这里调用匹配
function match(string, pattern) {
  let m = pattern.length;
  let n = string.length;
  if (!m || !n) return 0;
  let stateTable = computeStateTable(pattern);

  let state = 0;
  for (let i = 0; i < n; i++) {
    state = stateTable[state][string[i].charCodeAt(0)];
    if (state === m) return i - m + 1;
  }
  return -1;
}

match('$^@#*&@#$ajlkwqe123asda', '123a'); // 输出 16
```

## HTML PARSER

#### 我们用 FSM 来解析 HTML，最后生成一个 DOM 树，并且计算 CSS 添加到 DOM 树上。

##### 实现 css 复合选择器

1. 在构建 dom 树的时候，为元素添加氟元素指针`parent`
2. 每个元素有个属性`nthChild`来记录自己是父元素的第几个 child

- 子选择器 `>`
  - 我们可以把诸如 body div > p 看成两段 [body div] 和 [p]，然后用下面的`match`函数去递归的匹配这两段
- 相邻兄弟选择器 `+`
  - 道理同上 body div + p 看成两段 [body div] 和 [p]，然后用下面的`match`函数去递归的匹配
- 通用兄弟选择器 `~`
  - 道理同上 body div ~ p 看成两段 [body div] 和 [p]，然后用下面的`match`函数去递归的匹配

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
      // 通用兄弟选择器
      case '~':
        return immediaSiblings
          .slice(0, currentElement.nthChild)
          .some((element) => match(element, selectors.slice(0, i)));
      // 相邻兄弟选择器
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
        if (!['>', '~', '+'].includes(currentSelector)) {
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
                  "content": "\n  body div #myid{\n      width:100px;\n      background-color: #ff5000;\n  }\n  body img{\n      width:31px;\n      background-color: #ff1111;\n  }\n  div + p {\n      colore: red;\n  }\n  div ~ p {\n    background-color: red;\n  }\n  div > p {\n      color: blue;\n  }\n      "
                }
              ],
              "childLength": 0,
              "attributes": [],
              "tagName": "style",
              "parent": "head",
              "nthChild": 0,
              "computedStyle": {}
            },
            {
              "type": "text",
              "content": "\n  "
            }
          ],
          "childLength": 1,
          "attributes": [],
          "tagName": "head",
          "parent": "html",
          "nthChild": 0,
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
                  "content": "\n        "
                },
                {
                  "type": "element",
                  "children": [
                    {
                      "type": "text",
                      "content": "I am blue"
                    }
                  ],
                  "childLength": 0,
                  "attributes": [],
                  "tagName": "p",
                  "parent": "div",
                  "nthChild": 0,
                  "computedStyle": {
                    "color": {
                      "value": "blue",
                      "specificity": [0, 0, 0, 3]
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
                  "childLength": 0,
                  "attributes": [
                    {
                      "name": "id",
                      "value": "myid"
                    }
                  ],
                  "tagName": "img",
                  "parent": "div",
                  "nthChild": 1,
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
                  "childLength": 0,
                  "attributes": [],
                  "tagName": "img",
                  "parent": "div",
                  "nthChild": 2,
                  "computedStyle": {
                    "width": {
                      "value": "31px",
                      "specificity": [0, 0, 0, 2]
                    },
                    "background-color": {
                      "value": "#ff1111",
                      "specificity": [0, 0, 0, 2]
                    }
                  }
                },
                {
                  "type": "text",
                  "content": "\n          \n          "
                },
                {
                  "type": "element",
                  "children": [
                    {
                      "type": "element",
                      "children": [
                        {
                          "type": "text",
                          "content": "I am not blue"
                        }
                      ],
                      "childLength": 0,
                      "attributes": [],
                      "tagName": "p",
                      "parent": "span",
                      "nthChild": 0,
                      "computedStyle": {}
                    }
                  ],
                  "childLength": 1,
                  "attributes": [],
                  "tagName": "span",
                  "parent": "div",
                  "nthChild": 3,
                  "computedStyle": {}
                },
                {
                  "type": "text",
                  "content": "\n      "
                }
              ],
              "childLength": 4,
              "attributes": [],
              "tagName": "div",
              "parent": "body",
              "nthChild": 0,
              "computedStyle": {}
            },
            {
              "type": "text",
              "content": "\n      "
            },
            {
              "type": "element",
              "children": [
                {
                  "type": "text",
                  "content": " I am red "
                }
              ],
              "childLength": 0,
              "attributes": [],
              "tagName": "p",
              "parent": "body",
              "nthChild": 1,
              "computedStyle": {
                "colore": {
                  "value": "red",
                  "specificity": [0, 0, 0, 3]
                },
                "background-color": {
                  "value": "red",
                  "specificity": [0, 0, 0, 3]
                }
              }
            },
            {
              "type": "text",
              "content": "\n      "
            },
            {
              "type": "element",
              "children": [
                {
                  "type": "text",
                  "content": " I am not red"
                }
              ],
              "childLength": 0,
              "attributes": [],
              "tagName": "p",
              "parent": "body",
              "nthChild": 2,
              "computedStyle": {
                "background-color": {
                  "value": "red",
                  "specificity": [0, 0, 0, 3]
                }
              }
            },
            {
              "type": "text",
              "content": "\n  "
            }
          ],
          "childLength": 3,
          "attributes": [],
          "tagName": "body",
          "parent": "html",
          "nthChild": 1,
          "computedStyle": {}
        },
        {
          "type": "text",
          "content": "\n  "
        }
      ],
      "childLength": 2,
      "attributes": [
        {
          "name": "maaa",
          "value": "a"
        }
      ],
      "tagName": "html",
      "nthChild": 0,
      "computedStyle": {}
    }
  ],
  "childLength": 1
}
```
