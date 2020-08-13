const match = require('./kmp-with-state-machine');

describe('KMP with state machine', () => {
  it('should find word position in given text', () => {
    expect(match('', '')).toBe(0);
    expect(match('a', '')).toBe(0);
    expect(match('a', 'a')).toBe(0);
    expect(match('ababc', 'abc')).toBe(2);
    expect(match('mississippi', 'issip')).toBe(4);
    expect(match('abcbcglx', 'abca')).toBe(-1);
    expect(match('abcbcglx', 'bcgl')).toBe(3);
    expect(match('hello', 'll')).toBe(2);
    expect(match('mississippi', 'a')).toBe(-1);
    expect(match('$^@#*&@#$ajlkwqe123asda', '123a')).toBe(
      '$^@#*&@#$ajlkwqe123asda'.indexOf('123a')
    );
    expect(match('abdabcabcdabcdabcy', 'abcdabca')).toBe(
      'abdabcabcdabcdabcy'.indexOf('abcdabca')
    );
    expect(match('ewrdssdrqwwqabcwqeq', 'abc')).toBe(
      'ewrdssdrqwwqabcwqeq'.indexOf('abc')
    );
  });
});
