const http = require('http');
const server = http.createServer((req, res) => {
  console.log('request received');
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`<html maaa="a">
  <head>
    <style>
      #container {
        width: 500px;
        height: 300px;
        display: flex;
        background-color: rgb(255, 255, 255);
      }
      #container #myid {
        width: 200px;
        height: 100px;
        background-color: rgb(255, 0, 0);
        display: flex;
      }
      #myid > p {
        flex: 1;
        align-content: stretch;
        background-color: rgb(70, 52, 235);
        width: 50px;
      }
      #myid ~ p {
        align-content: stretch;
        background-color: rgb(25, 152, 185);
        width: 50px;
        height: 50px;
        display: flex;
      }
      p ~ span {
        background-color: rgb(226, 52, 235);
        width: 25px;
        height: 50px;
      }
      #container .c1 {
        background-color: rgb(0, 255, 0);
      }
    </style>
  </head>
  <body>
    <div id="container" >
      <div id="myid" >
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
        <p></p>
      </div>
      <div class="c1"></div>
      <p></p>
      <span></span>
      <p></p>
      <span></span>
      <p></p>
      <span></span>
      <p></p>
      <span></span>
    </div>
  </body>
</html>
`);
});

server.listen(8088);
