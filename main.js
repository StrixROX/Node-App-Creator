if(process.env.NODE_ENV === 'production'){
    const fs = require('fs')

    fs.readdirSync(".").forEach(file => console.log(`/${file}`))
    console.log()
    fs.readdirSync("./public").forEach(file => console.log(`/public/${file}`))
    console.log()
}

const express = require('express');
const favicon = require('serve-favicon');
const router = require('./routes/router');

const app = express();
const port = process.env.PORT || 3000;
const source = process.env.NODE_ENV === 'production' ? 'public/dist' : 'public/src';

app.use(favicon('./assets/favicon.ico'));

app.use('/', express.static(source, {"index": "index.html"}));
app.use('/', router);

app.use('/assets', express.static('assets'));

app.listen(port, () => console.log('Listening on port ' + port));