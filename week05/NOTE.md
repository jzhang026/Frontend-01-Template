# 每周总结可以写在这里

###### 我们熟悉的 httpClient

```javascript
let xhr = new XMLHttpRequest();
xhr.open('get', 'http://localhost:8088');
xhr.send(null);

xhr.addEventListener();
```

###### http

text protocal

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

- http method
  1. OPTIONS
  2. GET
  3. HEAD
  4. POST
  5. PUT
  6. DELETE
  7. TRACE
  8. CONNECT
