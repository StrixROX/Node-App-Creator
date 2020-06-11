const fs = require('fs');
const path = require('path');
const compress = require('compressing');

let busy = false;

function emptyDir(dirpath){
    if(fs.existsSync(dirpath)){
        const files = fs.readdirSync(dirpath);
        
        for(let file of files){
            if(fs.statSync(dirpath + "/" + file).isDirectory()){
                emptyDir(dirpath + "/" + file);
                fs.rmdirSync(dirpath + "/" + file);
            }else{
                fs.unlinkSync(dirpath + "/" + file);
            }
        }
    } else {
        console.log("Directory not found.")
    }
}

function generate(req, res){
    if(!busy){
        busy = true;
        emptyDir('./gen/app');
        if(fs.existsSync('./gen/app.zip')) fs.unlinkSync('./gen/app.zip')

        const allReqs = req.body;

        for(let i in allReqs){
            const type = allReqs[i].type;
            const path = './gen/app' + allReqs[i].path;
            const name = allReqs[i].name;
            const content = allReqs[i].content || null;
            
            if(type == 'folder'){
                if(!fs.existsSync(path + name)){
                    fs.mkdirSync(path + name)
                }
            }else if(type == 'file'){
                fs.writeFileSync(path + name, content);
            }
        }

        res.json({ok: true});
        
    }else{
        res.json({ok: false});
    }
}

function download(req, res){
    if(busy){
        if(fs.existsSync('./gen/app.zip')) fs.unlinkSync('./gen/app.zip');

        compress.zip.compressDir('./gen/app', './gen/app.zip')
        .then(() => {
            res.download(path.resolve('./gen/app.zip'), 'app.zip');
            busy = false;
        })
    }
}

module.exports = {
    generate: generate,
    download: download
}