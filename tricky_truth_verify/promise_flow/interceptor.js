const ah = require('async_hooks');

export let globalContext = {
  foo: () => console.log('global hooks'),
  someAsyncCode: (time) => this._promise(time),
  _promise: function (maxElapseTime = 200) {
    let time = 50 + Math.random() * 200;
    let words = ['A_Iron man', 'A_Captain America', 'A_hulk'];
    globalContext.foo();

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(words[Math.floor(Math.random() * words.length)]);
      }, time);
    });
  },
};

export async function cascaded() {
  let res;

  res = await globalContext.someAsyncCode();
  res = await globalContext.someAsyncCode();
  res = await globalContext.someAsyncCode();
  return res;
}
