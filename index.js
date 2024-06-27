import express from 'express';
import https from 'https';
import fs from 'fs';
import mysql from 'mysql';
import OpenAI from 'openai';
import { getRepo } from './functions/gitgen.js';
import { readChunk, createMysqlConnection, main } from './functions/sse.js';
import { register, login } from './controllers/auth.js';
import { headers } from './middlewares/posthead.js';
import { buildRag } from './functions/langchain.js';
import { rejects } from 'assert';
import { get } from 'http';


const app = express();

// Rest of the code...

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
app.use(headers);
//continuously check if repo exists
function checkRepo(owner,repo){
   if(fs.existsSync(`repo/${owner}${repo}.txt`)){
       return true;
   }else{
    return false;
   }
}

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
app.post('/api/generate',async (req,res)=>{
    console.log(req.socket.remoteAddress)
    console.log(req.headers['cookie']);
    const prompt = req.body.prompt;
    res.set({
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type",

        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    });
   main(res,prompt,client)
});
app.get('/api/getrepo',(req,res)=>{
    const owner = req.query.owner;
    const repo = req.query.repo;
    console.log(owner,repo);
    if(fs.existsSync(`repo/${owner}${repo}.txt`)){
        console.log('file exists');
        res.send('done');
    }else{
        getRepo(owner,repo).then(()=>{;
        res.send('done');
        }).catch((err)=>{
            res.send(err);
        })
    }
    
})
app.post('/api/invoke',async (req,res)=>{
    const owner = req.body.owner;
    const repo = req.body.repo;
    const prompt = req.body.prompt;
    //check if the path file exists
    if(fs.existsSync(`repo/${owner}${repo}.txt`)){
        console.log('file exists');
        const answer =await buildRag(`repo/${owner}${repo}.txt`,prompt);
    res.send(answer);
    }else{
        res.send('something went wrong');
    }

    
})
httpserver.listen((8080),()=>{
    
    console.log('Listening on port 8080');
})