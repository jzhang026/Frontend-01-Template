# 每周总结可以写在这里

我的作业链接请点这里： https://github.com/jzhang026/esmodule-mocha-boilerplate

本周感受最深的一句话，没有测试覆盖率的单元测试，跟没有一样。

此次我们用 NYC 收测试覆盖率，mocha 跑 unit test

# NodeJS, testing with Mocha and code converage with NYC

You’re done with your node app and you need to test, well there are many ways by which we can carry out our test. Here is a fun and easy way to carry out test.

> Mocha, a javascript test framework https://mochajs.org/

So istanbul/nyc is a code coverage tool which works well with mocha, they are simple and easy tools that make testing easy.

We can install mocha by typing this code in our terminal

`npm install -D mocha`

We install istanbul with

`npm install -D nyc`

after installation we add both to our test script in our package.json file(timeout optional)
`"test": "nyc mocha ./test/**/*.test.js --exit --inspect --timout=10000"`
Now we can simply run our mocha test by the typing the following command
`npm test`
With mocha we can run unit, integration and functional testing, unit test which allows us to know how each individual component works, integration test checks if all components work together as expected and functional(test) tests a slice of the whole application and matches it against specification(s).

Mocha can be written in different styles eg BDD, TDD

![image](https://github.com/jzhang026/Frontend-01-Template/blob/master/week18/image/NOTE.png)

First we describe what the test is about .

- In line 84 we then use the it() function to tell what exactly we want the test to do, within the it() function we perform our request and assertions.
- line 85: request object created,
- line 86: we send in our http request, here a parameter was also passed in,
- line 87: authorization parameter was set,
- line 89: 200 http status code is expected,
- line 90–94: Handles possible error and the done callback function is called.
  Mocha makes it easy for us to run test on asynchronous code, it allows for the use of

1. Callback functions : eg as seen in the block of code above the (done) is the callback function and it must be called for mocha to know it is done with that particular test and it should move on to the next.
2. Promises

For code coverage we can use istanbul/nyc, this tracks the test done on our code, shows what lines have been covered and also what hasn’t been covered.
