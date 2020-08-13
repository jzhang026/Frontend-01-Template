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
    // 键盘能够输入的只有最多256种ascii字符。所以我们针对这256种字符建立状态转移表
    // TODO: 这里处理的不好，我们可以把pattern string进行huffman编码来提升循环效率
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
  let n = string.length;
  let m = pattern.length;

  // pattern串为空，永远返回0
  if ((!n && !m) || !m) return 0;

  //主串为空，pattern串不为空，返回-1
  if (!n) return -1;

  // 构建状态转移表
  let stateTable = computeStateTable(pattern);

  let state = 0;
  for (let i = 0; i < n; i++) {
    state = stateTable[state][string[i].charCodeAt(0)];
    if (state === m) return i - m + 1;
  }
  return -1;
}
module.exports = match;
