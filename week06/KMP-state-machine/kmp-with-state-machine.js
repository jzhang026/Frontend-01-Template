// 我们可以用当前state， 下一个输入的字符，以及模式串 来算出下一个状态
function getNextState(pattern, state, currentCharacter) {
  if (state < pattern.length && currentCharacter == pattern[state])
    return state + 1;
  // 如果没匹配，找最长前缀,放入状态转移table
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
