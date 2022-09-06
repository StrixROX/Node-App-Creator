import { exports as explorer, projectFiles } from './explorer.js';

$('body').ready(() => {
    addFeatures([
        {name: 'General', active: true, disabled: true},
        'Routes Folder',
        'Favicon',
        'Host Assets Folder',
        '404 Page',
        'CSS',
        'Sass',
        'JS',
        'JQuery',
        'Bootstrap',
        'Bulma',
        'Grunt',
        'PostgreSQL'
    ]);

    explorer.init(getFeatures());

    $('button.create').click((e) => {
        if($(e.currentTarget).hasClass('idle')){
            addLoaderToButton($(e.currentTarget));

            const projectName = $('input.create').val();
            
            generateFiles(projectName)
            .then((res) => {
                if(res.ok){
                    showMsg('Files generated.', 'success');
                }else{
                    showMsg('There was a problem while generating some of the files.', 'danger');
                }
                return res
            })
            .then((res) => {
                if(res.ok) downloadFiles()
                return res
            })
            .then((res) => {
                removeLoaderFromButton($(e.currentTarget));
                if(res.ok){
                    $('label.feature:not([disabled])').removeClass('active')
                    $('label.feature:not([disabled])').attr('aria-pressed', 'false');
                    $('label.feature:not([disabled])').children('.feature')[0].removeAttribute('checked');
                    explorer.init(getFeatures());
                }
            });
        }
    });
});

function addFeatures(features){
    for(let i in features){
        let item = '';

        if(typeof(features[i]) == 'string'){
            item = `
                <label class="btn m-0 feature" data-toggle="button" aria-pressed="false">
                    <input type="checkbox" value="{{val}}" class="feature mx-1"> {{name}}
                </label>`;

            item = item
            .replace(/{{name}}/g, features[i])
            .replace(/{{val}}/g, features[i].replace(/ /g,'-').toLowerCase());
        }else{
            item = `
                <label class="btn m-0 feature" data-toggle="button" aria-pressed="false" {{disabled}}>
                    <input type="checkbox" value="{{val}}" class="feature mx-1" {{disabled}} {{checked}}> {{name}}
                </label>`;
            
            if(features[i].active){
                item = item
                .replace(/{{checked}}/g, 'checked')
                .replace(/aria-pressed="false"/g, 'aria-pressed="true"');
            }else{
                item = item.replace(/{{checked}}/g, '');
            }

            if(features[i].disabled){
                item = item.replace(/{{disabled}}/g,'disabled');
            }else{
                item = item.replace(/{{disabled}}/g,'');
            }

            item = item
            .replace(/{{name}}/g, features[i].name)
            .replace(/{{val}}/g, features[i].name.replace(/ /g,'-').toLowerCase());
        }


        $('.col.features').append(item);
    }

    $('label.feature:not([disabled])').click((e) => {
        const label = $(e.currentTarget);
        const checkbox = label.children('.feature')[0];

        checkbox.toggleAttribute('checked');

        explorer.init(getFeatures());
    })
}

function getFeatures(){
    let features = [];
    
    $('input.feature').each((i, el) => {
        if($(el).prop('checked')){
            features.push($(el).val());
        }
    })

    return features
}

function generateFiles(projectName){
    showMsg('Generating files for project <i>' + projectName + '</i>.', 'info');
   
    const features = getFeatures();
    const rawSiteUrl = features.includes('grunt') ? '/public/src/' : '/public/';

    projectFiles['/package.json'].updateContent(
        /"name": ""/g,
        '"name": "' + (projectName.trim() != '' ? projectName.replace(/ /g, '-').toLowerCase() : '') + '\"'
    );

    projectFiles[rawSiteUrl + 'index.html'].updateContent(
        /<title>Title/g,
        '<title>' + (projectName.trim() != '' ? projectName : "Title")
    );

    if(features.includes('404-page')){
        projectFiles['/public/404.html'].updateContent(
            /<title>Title/g,
            '<title>' + (projectName.trim() != '' ? projectName : "Title")
        );
    }

    let folders = [];
    let files = [];

    for(let i in projectFiles){
        if(projectFiles[i].type == 'folder') folders.push(projectFiles[i]);
        if(projectFiles[i].type == 'file') files.push(projectFiles[i]);
    }

    folders = folders.sort((a, b) => (a.path + a.name) < (b.path + b.name) ? -1 : 1);
    files = files.sort((a, b) => (a.path + a.name) < (b.path + b.name) ? -1 : 1);

    return new Promise(async (resolve, reject) => {
        await fetch('/generate', {
            "headers": {
                "Content-type": "application/json",
                "Accept": "application/json"
            },
            "method": "POST",
            "body": JSON.stringify(folders.concat(files))
        })
        .then((res) => res.json())
        .then((res) => {
            resolve(res);
        });
    })
}

function downloadFiles(){
    showMsg('Downloading Files.', 'info');

    $('body').append('<a href="/download" class="download-files"></a>');
    $('.download-files')[0].click();
    $('.download-files').remove();
}

function showFile(filename, content){
    if($('.modal.file').length == 0){
        let modal =
            `<div class="modal fade file" id="exampleModal" tabindex="-1" aria-labelledby="file-content" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content overflow-hidden">
                        <div class="modal-body p-0">
                            <div class="container-fluid">
                                <div class="row align-items-center border-bottom py-1">
                                    <div class="col"><p class="m-0 pt-1 file"></p></div>
                                    <div class="col pr-1">
                                        <button type="button" class="close btn btn-light" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="row content">
                                    <div class="col px-3 py-2"><pre class="mb-2"><code class="m-0 content"></code></pre></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        $('body').append(modal);
    }

    $('.modal.file').on('show.bs.modal', (e) => {
        $(e.currentTarget).find('p.file').text(filename);
        $(e.currentTarget).find('code.content').text(content);
    });

    $('.modal.file').modal({
        backdrop: true,
        keyboard: true,
        focus: true,
        show: true
    });

    $('.modal.file').on('hidden.bs.modal', (e) => {
        const fileUrl = $(e.currentTarget).find('p.file').html();
        $('[data-url="' + fileUrl + '"]').children('.col.file').removeClass('active');
    });
}

function showMsg(message, type = 'info'){
    if($('.alert-container').length == 0){
        let alertContainer = '<div class="alert-container p-3" role="alert"></div>';

        $('body').append(alertContainer);
    }

    let alert =
        `<div class="alert alert-{{type}} alert-dismissible fade show" role="alert">
            <p class="m-0">{{message}}</p>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>`;

    alert = alert
    .replace(/{{type}}/g, type)
    .replace(/{{message}}/g, message);

    $('.alert-container').append(alert);

    const thisAlert =$('.alert-container').children('.alert').last()[0];

    setTimeout(() => {
        $(thisAlert).alert('close');
    }, 4000);
}

function addLoaderToButton(el){
    el.removeClass('idle');
    el.addClass('busy');
    el.children('p').css({visibility: 'hidden', height: 0});
    el.append('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>');
}

function removeLoaderFromButton(el){
    el.removeClass('busy');
    el.addClass('idle');
    el.children('p').css({visibility: 'visible', height: 'auto'});
    el.children('.spinner-border').remove();
}

export const exports = {
    'getFeatures': getFeatures,
    'showFile': showFile,
    'showMsg': showMsg
}