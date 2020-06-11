import { exports as snips } from './contents.js';
import { exports as utils } from './main.js';

export let projectFiles = {};

class Folder{
    constructor(path, name){
        this.type = 'folder';
        this.path = path;
        this.name = name;

        this.addToExplorer();
    }
    
    addToExplorer(){
        projectFiles[this.path + this.name] = this;
    }

    deleteFolder(){
        delete projectFiles[this.path + this.name];

        $('[data-url="' + this.path + this.name + '"]').remove();
    }
}

class File{
    constructor(path, name){
        this.type = 'file';
        this.path = path;
        this.name = name;
        this.content = this.getContent().replace(/    /g, '\t');

        this.addToExplorer();
    }

    getContent(){
        let fileContent = snips.fileContents[this.path + this.name];

        if(typeof(fileContent) == 'function'){
            fileContent = fileContent();
        }
        
        const content = fileContent || ('File(' + this.path + this.name + ') => constructor: content returned undefined');

        return content
    }

    addToExplorer(){
        let path = this.path.split('/');
        path = path.filter((x) => x != '');

        let appendPath = '/';
        
        while(path.length > 0){
            const folder = new Folder(appendPath, path[0]);
            appendPath += path.shift() + '/';
        }

        projectFiles[this.path + this.name] = this;
    }

    deleteFile(){
        delete fileReqs[this.path + this.name];

        $('[data-url="' + this.path + this.name + '"]').remove();
    }

    updateContent(regex, value){
        this.content = this.content.replace(regex, value);
    }
}

function generateProjectStructure(features){
    const explorer = $('.explorer');
    explorer.children().remove(); //reset

    const rawSiteUrl = features.includes('grunt') ? '/public/src/' : '/public/';

    const structure = {
        'general': () => {
            const indexHtml = new File(rawSiteUrl, 'index.html');
            const gitignore = new File('/', '.gitignore');
            const mainJs = new File('/', 'main.js');
            const packageJson = new File('/', 'package.json');
        },
        'routes-folder': () => {
            const routesJs = new File('/routes/', 'routes.js');
            const routerFunctions = new File('/routes/', 'router_functions.js');
        },
        'favicon': () => {
            const favicon = new File('/assets/', 'favicon.ico');
        },
        'host-assets-folder': () => {
            if($('[data-url="' + '/assets' + '"]').length == 0){
                const assetsFolder = new Folder('/', 'assets');
            }
        },
        '404-page': () => {
            const _404Page = new File(rawSiteUrl, '404.html');
        },
        'css': () => {
            const cssFile = new File(rawSiteUrl + 'css/', 'styles.css');
        },
        'sass': () => {
            if($('[data-url="' + rawSiteUrl + 'css/styles.css' + '"]').length != 0){
                fileReqs[rawSiteUrl + 'css'].deleteFolder();
                fileReqs[rawSiteUrl + 'css/styles.css'].deleteFile();
            }
            const sassFile = new File(rawSiteUrl + 'sass/', 'styles.sass');
        },
        'js': () => {
            const jsFile = new File(rawSiteUrl + 'js/', 'main.js');
        },
        'jquery': () => {
            if($('[data-url="' + rawSiteUrl + 'js/main.js' + '"]').length == 0){
                const jsFile = new File(rawSiteUrl + 'js/', 'main.js');
            }
        },
        'grunt': () => {
            const gruntfile = new File('/', 'gruntfile.js');
        },
        'postgresql': () => {
            const configFile = new File('/', 'config.js');
        }
    }

    for(let i in features){
        if(features[i] in structure){
            structure[features[i]]()
        }
    }
    
}

function addProjectFilesToExplorer(){
    let folders = [];
    let files = [];

    for(let i in projectFiles){
        if(projectFiles[i].type == 'folder') folders.push(projectFiles[i]);
        if(projectFiles[i].type == 'file') files.push(projectFiles[i]);
    }

    folders = folders.sort((a, b) => (a.path + a.name) < (b.path + b.name) ? -1 : 1);
    files = files.sort((a, b) => (a.path + a.name) < (b.path + b.name) ? -1 : 1);

    for(let i in folders){
        const parentUrl = folders[i].path == '/' ? '/' : folders[i].path.slice(0, folders[i].path.length - 1);
        $('[data-url="' + parentUrl + '"]').append(snips.getFolderMarkup(folders[i].path, folders[i].name));
    }

    for(let i in files){
        const parentUrl = files[i].path == '/' ? '/' : files[i].path.slice(0, files[i].path.length - 1);
        $('[data-url="' + parentUrl + '"]').append(snips.getFileMarkup(files[i].path, files[i].name));
    }
}

function initExplorer(features){
    projectFiles = {};
    generateProjectStructure(features);
    addProjectFilesToExplorer();

    $('.explorer .row').off();
    $('.explorer .row').click((e) => {
        e.stopPropagation();
        const target = $(e.currentTarget);
        
        if(target.children().hasClass('active') && target.hasClass('expand')){
            $('.explorer .row').children().removeClass('active');
            target.children().removeClass('active');
            target.removeClass('expand');
        }else if(target.hasClass('expand')){
            $('.explorer .row').children().removeClass('active');
            target.children().addClass('active');
        }else{
            $('.explorer .row').children().removeClass('active');
            target.children().addClass('active');
            target.addClass('expand');
        }
    });

    $('.explorer .file').off();
    $('.explorer .file').click((e) => {
        const fileUrl = $(e.currentTarget).parent().attr('data-url');
        const content = projectFiles[fileUrl].content;

        utils.showFile(fileUrl, content);
    });
}

export const exports = {
    'init': initExplorer
}