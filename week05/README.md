# 每周总结可以写在这里

#### Realm

通过 BFS 遍历我们的内置对象的所有属性，并且将其可视化。
![Image of Realm](https://github.com/jzhang026/Frontend-01-Template/blob/master/week05/images/intinsic_object.png)

#### 我们熟悉的 httpClient

```javascript
let xhr = new XMLHttpRequest();
xhr.open('get', 'http://localhost:8088');
xhr.send(null);

xhr.addEventListener();
```

##### http

http 是一个应用层，文本协议，他的请求体如下所示：

```
// request
POST / HTTP/1.1 // -> Request line
Host: 127.0.0.1 // -> headers
Content-Type: appplication/x-www-form-urlencoded

field1=aaa&code=x%3D1 // -> body

// response
HTTP/1.1 200 OK
Content-Type: text/html
Date: Mon, 23 Dec 2020 06:05:19 GMT
Connection: keep-alive
Transfer-Encoding: chunked

26
<html><body> Hello World</body></html>

0
```

我们在本周，自己实现了一个玩具级别的 response parser。并为其编写了单元测试，来保证它的正确性
![unit test](https://github.com/jzhang026/Frontend-01-Template/blob/master/week05/images/unit-test_response_parser.png)
并且通过手动验证了，我们可以完整的解析 response

```
{ statusCode: 200,
  statusText: 'OK',
  headers:
   { 'Content-Type': 'text/plain',
     'X-Foo': 'bar',
     Date: 'Tue, 12 May 2020 10:03:45 GMT',
     Connection: 'keep-alive',
     'Transfer-Encoding': 'chunked' },
  body: 'ok' }
```
