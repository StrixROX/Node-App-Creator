const fs = require('fs');
const path = require('path');
console.log(path.join());
const compress = require('compressing');

let busy = false;

function removeDir(dirpath){
    if(fs.existsSync(path.join(__dirname, dirpath))){
        fs.rmSync(path.join(__dirname, dirpath), {
            recursive: true
        });
    }
}

function generate(req, res){
    if(!busy){
        busy = true;

        removeDir('../gen');

        const allReqs = req.body;

        for(let reqi of allReqs){
            const type = reqi.type;
            const filepath = '../gen/app' + reqi.path;
            const name = reqi.name;
            const content = reqi.content || null;
            
            if(type == 'folder'){
                if(!fs.existsSync(path.join(__dirname, filepath + name))){
                    fs.mkdirSync(path.join(__dirname, filepath + name), {recursive: true})
                }
            }else if(type == 'file'){
                fs.writeFileSync(path.join(__dirname, filepath + name), content);
            }
        }

        res.json({ok: true});
        
    }else{
        res.json({ok: false});
    }
}

function download(req, res){
    if(busy){
        if(fs.existsSync(path.join(__dirname, '../gen/app.zip'))) fs.rmSync(path.join(__dirname, '../gen/app.zip'));
        compress.zip.compressDir(path.join(__dirname, '../gen/app'), path.join(__dirname, '../gen/app.zip'))
        .then(() => {
            res.download(path.join(__dirname, '../gen/app.zip'), 'app.zip');

            removeDir('../gen/app')

            busy = false;
        })
    }
}

module.exports = {
    generate: generate,
    download: download
}