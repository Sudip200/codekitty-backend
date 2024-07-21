import { createMysqlConnection } from '../functions/sse.js';
import fs from 'fs';
const connection = createMysqlConnection();
function register(req,res){
    const { email, password, name } = req.body;

    const query2 = `SELECT * FROM codekitty WHERE email='${email}'`;
    connection.query(query2, (err, result) => {
        if (err) {
            console.log(err);
            res.send(`Error fetching data`);
            return;
        }
        if (result.length > 0) {
            res.send('Email already exists');
            return;
        }

        const query = `INSERT INTO codekitty (email,password,name) VALUES ('${email}','${password}','${name}')`;
        connection.query(query, (err, result) => {
            if (err) {
                console.log(err);
                res.send(`Error inserting data`);
                return;
            }
            // set cookie token that never expires and is secure and httponly and saved in /api/ path and save for one month
            res.cookie('token', 'authed', { httpOnly: true, secure: true, sameSite: 'None', path: '/api/', maxAge: 30 * 24 * 60 * 60 * 1000});
            //first send message and then redirect
            res.send('Registered now you can use extension');
            
            
        });
    });
}

function login(req,res){
    const { email, password } = req.body;
    const query = `SELECT * FROM codekitty WHERE email='${email}' AND password='${password}'`;
    connection.query(query, (err, result) => {
        if (err) {
            console.log(err);
            res.send(`Error fetching data`);
            return;
        }
        if (result.length === 0) {
            res.send('Invalid credentials');
            return;
        }
        // set cookie token that never expires and is secure and httponly and saved in /api/ path
        res.cookie('token', 'authed', { httpOnly: true, secure: true, sameSite: 'None', path: '/api/', maxAge: 30 * 24 * 60 * 60 * 1000});
        res.send('Logged in now you can use extension');
    });
}
function checkLines(path){
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf8', function(err, data){
            if(err) {
                reject(err);
                return;
            }
            var lines = data.trim().split('\n').length;
            console.log(lines);
            if(lines > 70000){
                resolve(true);
            } else {
                resolve(false); 
            }
        });
    });
}
export  {register,login,checkLines}