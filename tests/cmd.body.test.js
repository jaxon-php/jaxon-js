const $ = require('jquery');
const {
    cmd: { body },
    ajax: { handler },
    utils: { dom },
} = require('../dist/jaxon.module');

test('Assign element inner html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    body.assign({
        id: 'username',
        target: dom.$('username'),
        attr: 'innerHTML',
        value: 'Mister Johnson',
    });

    expect($('#username').text()).toBe('Mister Johnson');
});

test('Assign element inner html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    handler.execute({
        name: 'dom.assign',
        args: {
            id: 'username',
            attr: 'innerHTML',
            value: 'Mister Johnson',
        },
    });

    expect($('#username').text()).toBe('Mister Johnson');
});

test('Assign element outer html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    body.assign({
        id: 'username',
        target: dom.$('username'),
        attr: 'outerHTML',
        value: 'Mister Johnson',
    });

    expect($('#wrapper').text()).toBe('Mister Johnson');
});

test('Assign element outer html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    handler.execute({
        name: 'dom.assign',
        args: {
            id: 'username',
            attr: 'outerHTML',
            value: 'Mister Johnson',
        },
    });

    expect($('#wrapper').text()).toBe('Mister Johnson');
});
