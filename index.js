import express from 'express';
import https from 'https';
import fs from 'fs';
import mysql from 'mysql';
import OpenAI from 'openai';
import { getRepo } from './functions/gitgen.js';
import { readChunk, createMysqlConnection, main,chatWithGemma } from './functions/sse.js';
import { register, login, checkLines } from './controllers/auth.js';
import { headers } from './middlewares/posthead.js';
import { buildRag } from './functions/langchain.js';
import 'dotenv/config';

const app = express(); 
//OpenAI client (legacy)
const client = new OpenAI({apiKey:process.env.OPENAI_API_KEY});

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
   chatWithGemma(res,prompt)
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
    const filename= req.body.filename;
    //check if the path file exists
    try{
    if(fs.existsSync(`repo/${owner}${repo}.txt`)){ 
        console.log('file exists');
        
        const canDo = await checkLines(`repo/${owner}${repo}.txt`);
         if(canDo){ 
            res.send('file too large');
            return;
        }else{
            const answer =await buildRag(`repo/${owner}${repo}.txt`,prompt,filename);
            res.send(answer);
        }
       
    }else{ 
        console.log('error')
        res.send('something went wrong');
    }
}catch(err){
    console.log(err);
    res.send('something wrong');
}
 
    
})
//get number of lines in a file 


httpserver.listen((8080),()=>{
    
    console.log('Listening on port 8080');
})