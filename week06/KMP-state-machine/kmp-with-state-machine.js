// 我们可以用当前state， 下一个输入的字符，以及模式串 来算出下一个状态
// 我们这里状态机的状态，就是表示我们已经匹配到了模式串的第几个字符
function getNextState(pattern, state, currentCharacter) {
  if (state < pattern.length && currentCharacter == pattern[state])
    return state + 1;
  // 如果没匹配，找最长前缀,放入状态转移table
  // 最长前缀就是KMP中的所谓的好前缀与坏字符
  // 好前缀的长度就是我们下一个状态要转移去的状态
  for (let prefixLength = state; prefixLength > 0; prefixLength--) {
    if (pattern[prefixLength - 1] === currentCharacter) {
      let i = 0;
      while (i < prefixLength - 1) {
        if (pattern[i] != pattern[state - prefixLength + 1 + i]) break;
        i++;
      }
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
    // 能够输入的只有256种ascii字符。所以我们针对这255种字符建立状态转移表
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

function match(string, pattern) {
  let m = pattern.length;
  let n = string.length;
  if (!m || !n) return 0;
  let stateTable = computeStateTable(pattern);

  let state = 0;
  for (let i = 0; i < n; i++) {
    state = stateTable[state][string[i].charCodeAt(0)];
    debugger;
    if (state === m) return i - m + 1;
  }
  return -1;
}
module.exports = match;
