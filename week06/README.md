# 每周总结可以写在这里

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

#### html

1. 我们用 FSM 来实现 html 的分析
2. 解析标签
3. 创建元素
4. 在状态机中，除了状态迁移，我们还要加入业务逻辑
   1. 我们在标签结束状态提交 token
5. 总结
6. 文本节点
