#!/usr/bin/env node

var WebSocketServer = require('websocket').server;
var http=require('http');
var fs=require('fs');

var server = http.createServer(function(request, response){
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});
server.listen(8080,function() {
  console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
  httpServer: server, autoAcceptConnections: false
});

wsServer.on('request', function(request){
  var connection = request.accept(null,request.origin);
  console.log((new Date()) + ' Connection accepted.');
  connection.on('message', function(message){
    try{
      var json_obj = JSON.parse(message.utf8Data);
      console.log('Received json message:' + json_obj);
      if(json_obj.interface_type==='hough'){
        fs.readFile("test.png",'base64', function(err, data){
          json_send_data = {
                        "image": data,
                        "filter":{
                          "name":"hough",
                          "parameters": [ {"name":"theta","type":"double"}, {"name":"beta","type":"int"}]
                        } 
                      };
          console.log(json_send_data);
          connection.send(JSON.stringify(json_send_data));
        });
      }else{
        console.log('wrong interface_type');
      }
    }catch(e){
      if(message.type==='utf8'){
        console.log('Received non-json message: ' + message.utf8Data);
      }else if(message.type==='binary'){
        console.log('Received binary message of ' + message.binaryData.length + ' bytes');
      }
      else{
        console.log(e);
      }
    }
  });
  connection.on('close',function(reasonCode, description){
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
  });
});
