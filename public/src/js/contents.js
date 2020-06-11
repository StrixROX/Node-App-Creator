import { exports as utils } from './main.js';

const getFolderMarkup = (path, name) => {
    let markup =
`<div class="row w-100" data-url="{{url}}">
    <div class="col btn  btn-sm btn-block folder">{{name}}</div>
</div>`;

    markup = markup
    .replace(/{{name}}/g, name)
    .replace(/{{url}}/g, path + name);

    return markup
}

const getFileMarkup = (path, name) => {
    let markup =
`<div class="row w-100" data-url="{{url}}">
    <div class="col btn  btn-sm btn-block file">{{name}}</div>
</div>`;

    markup = markup
    .replace(/{{name}}/g, name)
    .replace(/{{url}}/g, path + name);

    return markup
}

const gitignore = () => {
    const features = utils.getFeatures();

    const ignores = {
        'general': '.vscode\nnode_modules',
        'grunt': 'public/dist'
    }

    let content = '';
    
    for(let i in features){
        if(features[i] in ignores) content += ignores[features[i]] + '\n'
    }

    return content
}

const packageJson = () => {
    const features = utils.getFeatures();
    
    const depsIndex = {
        'general': ['body-parser', 'express'],
        'favicon': ['serve-favicon'],
        'sass': ['node-sass'],
        'grunt': ['grunt', 'grunt-newer', 'grunt-contrib-htmlmin'],
        'postgresql': ['pg']
    };

    if(features.includes('css') || features.includes('sass')) depsIndex.grunt.push('grunt-autoprefixer');
    if(features.includes('css') && !features.includes('sass')) depsIndex.grunt.push('grunt-contrib-cssmin');
    if(features.includes('sass')) depsIndex.grunt.push('grunt-sass');
    if(features.includes('js')) depsIndex.grunt.push('grunt-contrib-uglify-es');

    const scriptsIndex = {
        'general': [
            ['dev', 'node main.js']
        ],
        'grunt': [
            ['build', 'grunt build'],
            ['start', 'npm run build && env NODE_ENV=production node main.js']
        ]
    }

    if(features.includes('grunt')){
        scriptsIndex['sass'] = [
            ['sass', 'node-sass --output-style compressed ./public/src/sass -o ./public/dist/css']
        ]
    }else{
        scriptsIndex['sass'] = [
            ['sass', 'node-sass --output-style compressed ./public/sass -o ./public/css']
        ]
    }

    let deps = {};
    let scripts = {};

    for(let i in features){
        const relatedDeps = depsIndex[features[i]];
        const relatedScripts = scriptsIndex[features[i]];
        for(let j in relatedDeps){
            deps[relatedDeps[j]] = "*"
        }
        for(let j in relatedScripts){
            scripts[relatedScripts[j][0]] = relatedScripts[j][1]
        }
    }

    let content = JSON.stringify({
        "name": '',
        "version": "1.0.0",
        "main": "main.js",
        "scripts": scripts,
        "author": "Strix",
        "license": "ISC",
        "dependencies": deps
    }, null, 4);

    content = content
    .replace(
        /"grunt-contrib-uglify-es": "\*"/g,
        '"grunt-contrib-uglify-es": "github:gruntjs/grunt-contrib-uglify#harmony"'
    );
    
    return content
}

const indexHtml = () => {
    const features = utils.getFeatures();
    
    let content = 
`<!DOCTYPE html>
<html lang="en">
<head>
\t<meta charset="UTF-8">
\t<meta name="viewport" content="width=device-width, initial-scale=1.0">
\t<title>Title</title>{{imports}}
</head>
<body>

</body>
</html>`;

    let cssImportsMarkup = '';
    let jsImportsMarkup = '';
    let cssFilesMarkup = '';
    let jsFilesMarkup = '';

    for(let i in features){
        cssImportsMarkup += indexHtmlContents['css-' + features[i]] || '';
        jsImportsMarkup += indexHtmlContents['js-' + features[i]] || '';
    }
    cssFilesMarkup += features.includes('css') || features.includes('sass') ? indexHtmlContents['css-file'] : '';
    jsFilesMarkup += features.includes('js') || features.includes('jquery') ? indexHtmlContents['js-file'] : '';

    cssImportsMarkup += cssImportsMarkup.trim().length > 0 ? '\n\t' : '';
    jsImportsMarkup += jsImportsMarkup.trim().length > 0 ? '\n\t' : '';
    cssFilesMarkup += cssFilesMarkup.trim().length > 0 ? '\n\t' : '';
    jsFilesMarkup += jsFilesMarkup.trim().length > 0 ? '\n\t' : '';

    let allImports = cssImportsMarkup + jsImportsMarkup + cssFilesMarkup + jsFilesMarkup;

    if(allImports.length > 0){
        allImports = allImports.slice(0, allImports.length - 2);
    }

    content = content.replace(/{{imports}}/g, allImports.trim().length > 0 ? '\n\t\n\t' + allImports : '');

    return content
}

const indexHtmlContents = {
    'css-bootstrap': 
    `<link
        rel="stylesheet"
        href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
        integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk"
        crossorigin="anonymous"
    />\n\t`,

    'css-bulma': `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.8.2/css/bulma.min.css">\n\t`,

    'js-jquery':
    `<script
        src="https://code.jquery.com/jquery-3.5.1.min.js"
        integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0="
        crossorigin="anonymous">
    </script>\n\t`,

    'js-bootstrap':
    `<script
        src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js"
        integrity="sha384-OgVRvuATP1z7JjHLkuOU7Xw704+h835Lr+6QL9UvYjZE3Ipu6Tp75j7Bh/kR0JKI"
        crossorigin="anonymous">
    </script>\n\t`,

    'css-file': '<link rel="stylesheet" href="./css/styles.css" />',

    'js-file': '<script src="./js/main.js"></script>',
}

const mainJs = () => {
    const features = utils.getFeatures();
    
    let content = '';
    content += "const express = require('express');\n";
    content += !(features.includes('routes-folder')) ? mainJsContents['body-parser'].import : '';
    content += features.includes('favicon') ? mainJsContents['favicon'].import : '';
    content += features.includes('routes-folder') ? mainJsContents['routes-folder'].import : '';
    content += features.includes('postgresql') && !features.includes('routes-folder') ? mainJsContents['psql'].import : '';
    
    content += '\n';

    content += "const app = express();\n";
    content += "const port = process.env.PORT || 3000;\n";
    content += features.includes('grunt') ? mainJsContents['site-url'].import : '';

    content += '\n';

    content += features.includes('favicon') ? mainJsContents['favicon'].use + '\n' : '';

    content +=
    features.includes('grunt')
    ? "app.use('/', express.static(site_url, {index: 'index.html'}));\n"
    : "app.use('/', express.static('public', {index: 'index.html'}));\n";

    content += features.includes('routes-folder') ? mainJsContents['routes-folder'].use : '';

    content += '\n';

    content += features.includes('host-assets-folder') ? mainJsContents['host-assets-folder'].use + '\n' : '';

    const _404Page = features.includes('grunt')
    ? mainJsContents['404-page'].use.replace(/{{path}}/g, 'public/dist')
    : mainJsContents['404-page'].use.replace(/{{path}}/g, 'public');

    content += features.includes('404-page') ? _404Page + '\n' : '';

    content += "app.listen(port, () => console.log('Listening on port ' + port));";

    return content
}

const mainJsContents = {
    'body-parser': {
        import: "const body_parser = require('body-parser');\n"
    },
    'favicon': {
        import: "const favicon = require('serve-favicon');\n",
        use: "app.use(favicon('./assets/favicon.ico'));\n"
    },
    'routes-folder': {
        import: "const routes = require('./routes/routes');\n",
        use: "app.use('/', routes);\n"
    },
    'site-url': {
        import: "const site_url = process.env.NODE_ENV == 'production' ? 'public/dist' : 'public/src';\n"
    },
    '404-page': {
        use:
`app.use(function(req, res, next){
    res.status(404).sendFile('{{path}}/404.html', {root: __dirname });
});\n`
    },
    'host-assets-folder':{
        use: `app.use('/assets', express.static('assets'));\n`
    },
    'psql': {
        import: `const { pool } = require('./config');\n`
    }
}

const gruntfile = () => {
    const features = utils.getFeatures();
    
    let content = features.includes('sass') ? `const sass = require('node-sass');\n\n` : '';
    content += `module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({{configs}});
  
    // Loading plugins{{plugins}}
    
    // Declaring task(s).

    grunt.registerTask('build', {{build-tasks}});
};`
    
    const pluginsIndex = {
        'general': {
        task: ['newer:htmlmin:build'],
        load: `grunt.loadNpmTasks('grunt-newer');\n\tgrunt.loadNpmTasks('grunt-contrib-htmlmin');`,
        config:
        `htmlmin: {
            build: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [{
                    expand: true,
                    cwd: 'public/src/',
                    src: '**/*.html',
                    dest: 'public/dist/'
                }]
            }
        }`
    },

        'js': {
        task: ['newer:uglify:build'],
        load: `grunt.loadNpmTasks('grunt-contrib-uglify-es');`,
        config:
        `uglify: {
            build: {
                options: {
                    compress: true,
                    sourceMap: false,
                    output: {
                        comments: false
                    }
                },
                files: [
                    {
                        expand: true,
                        cwd: 'public/src/js/',
                        src: '**/*.js',
                        dest: 'public/dist/js/'
                    }
                ]
            }
        }`
    },

        'css': {},

        'autoprefixer': {
        task: ['newer:autoprefixer:build'],
        load: `grunt.loadNpmTasks('grunt-autoprefixer');`,
        config:
        `autoprefixer: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'public/dist/',
                    src: '**/*.css',
                    dest: 'public/dist/'
                }]
            }
        }`
    },

        'cssmin': {
        task: ['newer:cssmin:build'],
        load: `grunt.loadNpmTasks('grunt-contrib-cssmin');`,
        config:
        `cssmin: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'public/src/',
                    src: '**/*.css',
                    dest: 'public/dist/',
                    extension: '.css'
                }]
            }
        }`
    },

        'sass': {
        task: ['newer:sass:build'],
        load: `grunt.loadNpmTasks('grunt-sass');`,
        config:
        `sass: {
            build: {
                options: {
                    implementation: sass,
                    sourceMap: false,
                    outputStyle: 'compressed',
                    precision: 3
                },
                files: [{
                    expand: true,
                    cwd: 'public/src/sass/',
                    src: '**/*.sass',
                    dest: 'public/dist/css',
                    ext: '.css'
                }]
            }
        }`
    }

    }

    if(features.includes('sass') && features.includes('css')){
        pluginsIndex.css.config = '',
        pluginsIndex.sass.config += ',\n\n\t\t' + pluginsIndex.autoprefixer.config;

        pluginsIndex.sass.load += '\n\t' + pluginsIndex.autoprefixer.load;
        pluginsIndex.sass.task = pluginsIndex.sass.task.concat(pluginsIndex.autoprefixer.task);
    }
    else if(features.includes('css') && !features.includes('sass')){
        pluginsIndex.css.config = pluginsIndex.cssmin.config;
        pluginsIndex.css.config += ',\n\n\t\t' + pluginsIndex.autoprefixer.config;

        pluginsIndex.css.load = pluginsIndex.cssmin.load + '\n\t' + pluginsIndex.autoprefixer.load;
        pluginsIndex.css.task = pluginsIndex.cssmin.task.concat(pluginsIndex.autoprefixer.task);
    }
    else if(features.includes('sass') && !features.includes('css')){
        pluginsIndex.sass.config += ',\n\n\t\t' + pluginsIndex.autoprefixer.config;

        pluginsIndex.sass.load += '\n\t' + pluginsIndex.autoprefixer.load;
        pluginsIndex.sass.task = pluginsIndex.sass.task.concat(pluginsIndex.autoprefixer.task);
    }

    let configs = `{\n\t\tpkg: grunt.file.readJSON('package.json')`;
    let plugins = '';
    let buildTasks = [];

    for(let i in features){
        let relatedPlugins = pluginsIndex[features[i]] || {};
        configs += relatedPlugins.config ? ',\n\n\t\t' + relatedPlugins.config : '';
        plugins += relatedPlugins.load ? '\n\t' + relatedPlugins.load : '';
        if(relatedPlugins.task) buildTasks = buildTasks.concat(relatedPlugins.task);
    }

    configs += '\n\t}';
    buildTasks = JSON.stringify(buildTasks);

    content = content.replace(/{{configs}}/g, configs);
    content = content.replace(/{{plugins}}/g, plugins);
    content = content.replace(/{{build-tasks}}/g, buildTasks);

    return content
}

const routesJs = `const express = require('express');
const body_parser = require('body-parser');
const rf = require('./router_functions');
const router = express.Router();

module.exports = router;`;

const routerFunctions = () => {
    const features = utils.getFeatures();
    
    let content = '';
    
    if(features.includes('postgresql') && features.includes('routes-folder')){
        content += `const { pool } = require('../config');\n\n`;
    }

    content +=
`//the router functions go here

module.exports = {
\t//all exports go here
}`;

    return content
}

const _404Page = `<html lang="en">
<head>
\t<meta charset="UTF-8">
\t<meta name="viewport" content="width=device-width, initial-scale=1.0">
\t<title>Title - Page not found</title>
\t<link rel="stylesheet" href="./css/styles.css">
</head>
<body>
\t<div class="banner-container">
\t\t<div class="banner">
\t\t\t<h1 class="title">Oops!</h1>
\t\t\t<p class="message">Seems like the page you requested does not exist.</p>
\t\t</div>
\t\t<a href="/" class="link">← Go back to app</a>
\t</div>
</body>
</html>`;

const stylesCss = `body{
    margin: 0;
}

*{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    text-decoration: none;
    outline: none;
}`;

const stylesSass = `body
    margin: 0

*
    margin: 0
    padding: 0
    box-sizing: border-box
    text-decoration: none
    outline: none`;

const mainJsFile = () => {
    const features = utils.getFeatures();
    if(features.includes('jquery')){
        return `$('body').ready(() => {\n\t\n});`
    }else{
        return '//all js code goes here'
    }
};

const psql = `const { Pool, Client } = require('pg');

let configs;
if(process.env.NODE_ENV == 'production'){
    configs = {
        connectionString: process.env.DATABASE_URL,
        ssl: false
    }
}else{
    configs = {
        user: 'postgres',
        host: 'localhost',
        database: '', //fill-in
        password: '', //fill-in
        port: 5432,
    }
}

const client = new Client(configs);
client.connect();

const pool = new Pool(configs);

module.exports = { pool }`

const fileContents = {
    '/public/index.html': indexHtml,
    '/public/src/index.html': indexHtml,
    '/.gitignore': gitignore,
    '/main.js': mainJs,
    '/package.json': packageJson,
    '/routes/routes.js': routesJs,
    '/routes/router_functions.js': routerFunctions,
    '/assets/favicon.ico': '//replace this file by the actual favicon',
    '/public/404.html': _404Page,
    '/public/src/404.html': _404Page,
    '/public/css/styles.css': stylesCss,
    '/public/src/css/styles.css': stylesCss,
    '/public/sass/styles.sass': stylesSass,
    '/public/src/sass/styles.sass': stylesSass,
    '/public/js/main.js': mainJsFile,
    '/public/src/js/main.js': mainJsFile,
    '/gruntfile.js': gruntfile,
    '/config.js': psql
}

export const exports = {
    'getFolderMarkup': getFolderMarkup,
    'getFileMarkup': getFileMarkup,
    'fileContents': fileContents
}