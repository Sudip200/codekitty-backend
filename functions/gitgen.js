import { Octokit } from "octokit";
import fs from "fs";
import path from "path";
const octokit = new Octokit({
auth: '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'
})
function dfs(repoarr,owner,repo){
    
for(let i=0;i<repoarr.length;i++){
  console.log(repoarr[i].type)
  if(repoarr[i].type=="dir"){
    console.log(repoarr[i].path)
    if(repoarr[i].path==".github" || repoarr[i].path=="node_modules" || repoarr[i].path=="public" ){
      continue
    }
     getRepoFiles(owner,repo,repoarr[i].path).then((data)=>{
      dfs(data,owner,repo)
    })
   
  }else{
    console.log(repoarr[i].path)
  if(repoarr[i].path == "package-lock.json"){
    continue
  }
  //if file is blob like .png .jpeg .jpg .gif .svg .mp4 .mp3 .pdf .doc .docx .ppt .pptx 
  if(repoarr[i].path.match(/\.(png|jpeg|jpg|gif|svg|mp4|mp3|pdf|doc|docx|ppt|pptx)$/)){
    continue
  }

    getRepoContent(owner,repo,repoarr[i].path)
  }
}
}

 async function getRepoFiles(owner,repo,path){
  console.log(path)
   const data = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner: owner,
      repo: repo,
      path: path,
    })
    return data.data
  }
  function getRepoContent(owner,repo,path){
    octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner: owner,
      repo: repo,
      path: path,
    }).then(({data}) => {
     
      
         const content = Buffer.from(data.content, 'base64').toString()
         let output = `# ${data.name}\n\n${content}\n\n`
       //append content to file
        fs.appendFile(`repo/${owner}${repo}.txt`,output, function (err) {
          if (err) throw err;
          console.log('Saved!');
        }); 
      }).catch((err) => {
        console.log(err)
      }
      )
  }
 async function getRepo(owner,repo){
  console.log('getRepo')
  octokit.request("GET /repos/{owner}/{repo}/contents", {
    owner: owner,  
    repo: repo,
  }).then(({data}) => {
    dfs(data,owner,repo)
  }).catch((err) => { 
    console.log(err) 
  }
  )
}

export {getRepo}