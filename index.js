import React from 'react';
import ReactDOM from 'react-dom';
import { Table, Card } from 'antd';
import './index.css';
import moment from 'moment';
// import moment from 'moment';
// let socket = new WebSocket("ws://localhost:8092/guest");
// let socket;
let wsUrl = "ws://localhost:8092/guest";
let lockReconnect;
let socket;
    //心跳检测
let heartCheck = {
  timeout: 3000, //心跳包超时时间
  timeoutObj: null,
  serverTimeoutObj: null,
  reset: function (){
    clearTimeout(this.timeoutObj);
    clearTimeout(this.serverTimeoutObj);
    this.start();
  },
  start: function(){
    console.log('start');
    let self = this;
    this.timeoutObj = setTimeout(function(){
      //这里发送一个心跳，后端收到后，返回一个心跳消息，
      socket.send("HeartBeat");
      //服务器响应超时，关闭连接
      self.serverTimeoutObj = setTimeout(function() {
        socket.close();
      }, self.timeout);

    }, this.timeout)
  }
}

class App extends React.Component {
  constructor(props){
    super(props);
    this.state={
      name:'',
      time:''
    }
  }
  componentDidMount(){
    this.createWebSocket();
  }
  createWebSocket=()=>{
    try {
      socket = new WebSocket(wsUrl);
      
      this.init();
    } catch(e) {
      console.log('catch');
      this.reconnect(wsUrl);
    }
  }
  init =()=>{
    socket.onclose = closeEvent => {
      console.log("WebSocket closed.");
      this.reconnect(wsUrl);
    }; 
    socket.onerror = errorEvent => {
      console.log("WebSocket error: ", errorEvent);
      this.reconnect(wsUrl);
    };
    socket.onopen = function(openEvent) {
      //心跳检测重置
      heartCheck.start();
      console.log("WebSocket conntected.");
    };
    socket.onmessage = res =>{
      //当服务器返回消息时计时器清零。
      heartCheck.reset();
      let data= JSON.parse(res.data);
      this.setState({
        data
      })
   }
  }

  reconnect=(url)=>{
    if(lockReconnect) {
      return;
    };
    lockReconnect = true;
    //没连接上会一直重连，设置延迟避免请求过多
    let tt;
    clearTimeout(tt);
    tt = setTimeout(()=> {
      this.createWebSocket(url);
      lockReconnect = false;
    }, 4000);
  }
  render(){
    let { data} = this.state;
    const columns = [{
      title: '姓名',
      dataIndex: 'name',
      render: (text, record)=> <span>{`${text}${record.surname}`}</span>,
      key: 'name',
    }, {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (text, record) => <span>{text == 'female'? '女': '男'}</span>
    },{
      title: '国家',
      dataIndex: 'region',
      key: 'region',
    }];
    console.log(data)
    return(
      <div style={{ background: '#ECECEC', padding: '30px'}}>
        <Card  title="WebSocket实践(1)" style={{padding:'24px', width: 700, margin: '0 auto'  }}>
          <Table dataSource={data} columns={columns}  />
        </Card>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
