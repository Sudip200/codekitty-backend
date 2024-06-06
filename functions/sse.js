const mysql = require('mysql');
const express = require('express');
const app = express();

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
    stream = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
                 
          messages: [{ role: "user", content: prompt }],
          stream: true,
      });
      for await (const chunk of stream) {
           if(chunk.choices[0]?.finish_reason){
              res.write('data: sdjnjsdnsdka\n\n');
              res.end();
              return;   
           }
        res.write(`data: ${chunk.choices[0]?.delta?.content || "sdxlp"}\n\n`);
        //res.write(chunk.choices[0]?.delta?.content)
       }
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

module.exports = {readChunk,createMysqlConnection,main}