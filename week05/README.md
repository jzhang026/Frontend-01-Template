# 每周总结可以写在这里

#### Realm

从 JavaScript 标准中可以找到全部的 JavaScript 对象定义。JavaScript 语言规定了全局对象的属性。

- 三个值
  ```
  Infinity、NaN、undefined
  ```
- 九个函数
  ```
  eval,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURIencodeURI,Component
  ```
- 一些构造器

  ```
  Array、Date、RegExp、Promise、Proxy、Map、WeakMap、Set、WeakSet、Function、Boolean、String、Number、Symbol、Object、Error、EvalError、RangeError、ReferenceError、SyntaxError、TypeError、URIError、ArrayBuffer、SharedArrayBuffer、DataView、Typed Array、Float32Array、Float64Array、Int8Array、Int16Array、Int32Array、UInt8Array、UInt16Array、UInt32Array、UInt8ClampedArray
  ```

  使用广度优先搜索，查找这些对象所有的属性和 Getter/Setter，就可以获得 JavaScript 中所有的固有对象

  ```javascript
  let globalProperties = [
    'eval',
    'isFinite',
    'isNaN',
    'parseFloat',
    'parseInt',
    'decodeURI',
    'decodeURIComponent',
    'encodeURI',
    'encodeURIComponent',
    'Array',
    'Date',
    'RegExp',
    'Promise',
    'Proxy',
    'Map',
    'WeakMap',
    'Set',
    'WeakSet',
    'Function',
    'Boolean',
    'String',
    'Number',
    'Symbol',
    'Object',
    'Error',
    'EvalError',
    'RangeError',
    'ReferenceError',
    'SyntaxError',
    'TypeError',
    'URIError',
    'ArrayBuffer',
    'SharedArrayBuffer',
    'DataView',
    'Float32Array',
    'Float64Array',
    'Int8Array',
    'Int16Array',
    'Int32Array',
    'Uint8Array',
    'Uint16Array',
    'Uint32Array',
    'Uint8ClampedArray',
    'Atomics',
    'JSON',
    'Math',
    'Reflect',
  ];
  // 由于我们后面要用antv把对象之间的关系可视化出来，所以我们要维护一个object 用来存储关系数据
  // 在初始化时，我们先把所有的对象当作是`realm`的子元素
  /**
  type realationShipType = {
    id: string,
    children?: Array<realationShipType>
  }
  */
  let relationShip = { id: 'realm', children: [] };

  for (let p of globalProperties) {
    relationShip.children.push({ id: p, children: [] });
  }

  // set用来防止对象的重复访问
  let set = new Set();
  let current;

  //借助队列来实现广度优先搜索
  let childrenQueue = [].concat(relationShip.children);
  // 开始遍历
  while (childrenQueue.length) {
    // 每次从队头取出一个对象
    /**
    type current = {
      id: string,
      children?: Array<current>
    }
    */
    current = childrenQueue.shift();

    if (set.has(this[current.id]) || !this[current.id]) continue;

    set.add(this[current.id]);

    // 遍历当前对象上的所有属性
    for (let p of Object.getOwnPropertyNames(this[current.id])) {
      const property = Object.getOwnPropertyDescriptor(this[current.id], p);
      if (
        property.hasOwnProperty('value') &&
        property.value != null &&
        (typeof property.value == 'object' ||
          typeof property.value == 'function') &&
        property.value instanceof Object
      ) {
        let currentProperty = { id: p + ' [[value]]', children: [] };
        //将拿到的对象那个插入队列，接着访问
        childrenQueue.push(currentProperty);
        // 此对象加入到父元素的children数组中
        current.children.push(currentProperty);
      }
      if (property.hasOwnProperty('get') && typeof property.get == 'function') {
        let currentProperty = { id: p + ' [[get]]', children: [] };
        childrenQueue.push(currentProperty);
        current.children.push(currentProperty);
      }
      if (property.hasOwnProperty('set') && typeof property.set == 'function') {
        let currentProperty = { id: p + ' [[set]]', children: [] };
        childrenQueue.push(currentProperty);
        current.children.push(currentProperty);
      }
    }
  }
  ```

  运行完成后的对象关系截图，也可以戳此直接访问[[realm]](https://github.com/jzhang026/Frontend-01-Template/blob/master/week05/realm/realm.html)
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
