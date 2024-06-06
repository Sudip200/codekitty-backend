const express =require('express')
const https = require('https');
const fs = require('fs');
const mysql = require('mysql');
const OpenAI = require('openai');
const app = express();
const uuid = require('uuid');
const {readChunk,createMysqlConnection, main} = require('./functions/sse');
const {register,login} = require('./controllers/auth');

const client = new OpenAI({apiKey:'sk-proj-psFzu1ixHIBuMEx3FxMUT3BlbkFJOQoFZSwgUwm3pYTZUYcd'});

const httpserver = https.createServer({
    key: fs.readFileSync('/home/sudipto/ollama/sslkeys/privkey.pem'),
    cert: fs.readFileSync('/home/sudipto/ollama/sslkeys/fullchain.pem')
}, app);  
const connection = createMysqlConnection(); 
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.get('/',(req,res)=>{
    res.send('server running')
})
app.post('/api/login',login);
app.post('/api/register',register);
app.get('/api/generate',async (req,res)=>{
    console.log(req.socket.remoteAddress)
    console.log(req.headers['cookie']);
    
    

    const prompt = req.query.prompt;
    const model = req.query.model;
    res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "https://github.com",
        "Access-Control-Allow-Credentials": "true",
    });
    
    // const response=   await fetch('http://localhost:11434/api/generate',{
    //     method:'POST',
    //     body:JSON.stringify({prompt:prompt,model:model}),
    // });
    // const reader = response.body.getReader();
    // readChunk(res,reader);
    
   main(res,prompt,client)
 
  
})
httpserver.listen((8080),()=>{
    
    console.log('Listening on port 8080');
})