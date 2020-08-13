function match(str, pat) {
  let n = str.length;
  let m = pat.length;

  // pattern串为空，永远返回0
  if ((!n && !m) || !m) return 0;

  //主串为空，pattern串不为空，返回-1
  if (!n) return -1;
  let j, i;
  debugger;
  for (i = 0, j = 0; i < n && j < m; i++) {
    if (str[i] === pat[j]) {
      j++;
    } else if (j > 0) {
      let jj = --j;
      let ii = i - 1;
      while (jj >= 0) {
        // j

        if (str[ii--] === pat[jj--]) continue;
        ii = i - 1;
        jj = --j;
      }
    }
  }
  if (j == m) return i - m;
  return -1;
}
match('mississippi', 'issip');
module.exports = match;
