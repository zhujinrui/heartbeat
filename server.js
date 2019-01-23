var request = require("request");
var WebSocket = require("ws"),
    WebSocketServer = WebSocket.Server,
    wss = new WebSocketServer({
        port: 8092,
        path: "/guest"
    });
 
// 收到来自客户端的连接请求后，开始给客户端推消息
wss.on("connection", function(ws) {
    ws.isAlive = true;
    ws.on('pong', heartbeat); //心跳检测
    ws.on("message", function(message) {
        console.log("received: %s", message);
    });
    sendGuestInfo(ws);
});
 
function sendGuestInfo(ws) {
    request("https://uinames.com/api/?ext && amount=25 &&region=china",
        function(error, response, body) {
            if (!error && response.statusCode === 200) {
                var jsonObject = JSON.parse(body);

                if (ws.readyState === WebSocket.OPEN) {
 
                    // 发，送
                    ws.send(JSON.stringify(jsonObject));
 
                    //用随机来“装”得更像不定时推送一些
                    setTimeout(function() {
                        sendGuestInfo(ws);
                    }, (Math.random() * 5 + 2) * 1000);
                }
            }
        });
}
//心跳检测
heartbeat = ()=>{
    this.isAlive = true;
}

//心跳复活
const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
      if (ws.isAlive === false) return ws.terminate();
   
      ws.isAlive = false;
      ws.ping('', false, true);
    });
  }, 30000);