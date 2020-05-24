const http = require('http');
const server = http.createServer((req, res) => {
  console.log('request received');
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`<html maaa=a >
  <head>
      <style>
  body div #myid{
      width:100px;
      background-color: #ff5000;
  }
  body img{
      width:31px;
      background-color: #ff1111;
  }
  div + p {
      colore: red;
  }
  div ~ p {
    background-color: red;
  }
  div > p {
      color: blue;
  }
  .example {
      font-size: 14px;
  }
      </style>
  </head>
  <body>
      <div>
        <p>I am blue</p>
        <aa class='add'> asdfas</aa>
        <img id="myid" class='ads' />
        <img />
        
        <em><p class="example" >I am not blue</p></em>
      </div>
      <p> I am red </p>
      <p> I am not red</p>
      <span class="example" > test class </span>
  </body>
  </html>`);
});

server.listen(8088);
