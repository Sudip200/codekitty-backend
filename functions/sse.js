import mysql from 'mysql';
import OpenAI from 'openai';
import express from 'express'; 
import { GoogleGenerativeAI } from '@google/generative-ai';
const app = express();
const genAI = new GoogleGenerativeAI('AIzaSyADZAOPNRFAvkgZMTX6H0K0OF2FTp9SzWE');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
function readChunk(res,reader){
    reader.read().then(({done,value})=>{
        if(done){
            res.write('data: sdjnjsdnsdka\n\n');
            res.end();
            return;
        }
            const decoder = new TextDecoder('utf-8');
            const text = decoder.decode(value);
             const json = JSON.parse(text);
           //starts with ** and ends with **
           res.write(`data: ${json.response}\n\n`);
           readChunk(res,reader);
     });
    
   
   } 
   async function main(res,prompt,client) {
   let  stream = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
                 
          messages: [
            { role: "system", content: `You are CodeKitty a friendly AI that helps to understand github repositories.
                 You can ask me anything about a github repository and I will try to answer it. You should not share any sensitive information with me.
                 You should not answer any other questions than the ones related to github repositories.`},
            { role: "user", content: prompt }],
          stream: true,
      });
      for await (const chunk of stream) {
           if(chunk.choices[0]?.finish_reason){
              res.end();
              return;   
           }
        //res.write(`data: ${chunk.choices[0]?.delta?.content || "sdxlp"}\n\n`);
        res.write(chunk.choices[0]?.delta?.content)
       }
  }
  async function chatWithGemma(res,prompt){
   const result = await model.generateContentStream(prompt);
   for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    res.write(chunkText);
  }

    res.end();
  }
function createMysqlConnection(){
    const connection = mysql.createConnection({
        host: 'localhost',
        user:'root',
        password:'sudip@1234',
        database:'codekitty'
    });

    connection.connect((err)=>{
        if(err){
            console.log('Error connecting to mysql');
            return;
        }
        console.log('Connected to mysql');
    });
    return connection;
}

function checkifReqfromBrowser(req){
   if(req.headers['User-Agent'].includes('Mozilla')){
       return true;
   }else{
       return false;
   }
}

export {createMysqlConnection,checkifReqfromBrowser,main,readChunk ,chatWithGemma}