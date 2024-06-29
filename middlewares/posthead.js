function headers(req,res,next){
    res.set({
        "Access-Control-Allow-Origin": "https://github.com",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        
    }); 
    next();
}
  
export {headers}   