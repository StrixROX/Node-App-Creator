const express = require('express');
const favicon = require('serve-favicon');
const routes = require('./routes/routes');

const app = express();
const port = process.env.PORT || 3000;
const site_url = process.env.NODE_ENV == 'production' ? 'public/dist' : 'public/src';

app.use(favicon('./assets/favicon.ico'));

app.use('/', express.static(site_url, {"index": "index.html"}));
app.use('/', routes);

app.use('/assets', express.static('assets'));

app.listen(port, () => console.log('Listening on port ' + port));