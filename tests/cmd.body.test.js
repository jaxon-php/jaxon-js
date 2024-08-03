const $ = require('jquery');
const u = require('umbrellajs');
const {
    config,
    cmd: { body },
    ajax: { command: handler },
    utils: { dom },
    parser: { query },
} = require('../dist/jaxon.module');

// Init the selector library.
query.init(u);

const makeRequest = commands => ({
    status: config.status.dontUpdate,
    cursor: config.cursor.dontUpdate,
    response: {
        content: {
            jxn: {
                commands,
            },
        },
    },
});

test('Assign element inner html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    body.assign({
        attr: 'innerHTML',
        value: 'Mister Johnson',
    }, {
        target: dom.$('username'),
    });

    expect($('#username').text()).toBe('Mister Johnson');
});

test('Assign element inner html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    const command = {
        name: 'dom.assign',
        args: {
            id: 'username',
            attr: 'innerHTML',
            value: 'Mister Johnson',
        },
    };

    handler.processCommands(makeRequest([command]));

    expect($('#username').text()).toBe('Mister Johnson');
});

test('Assign element outer html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    body.assign({
        attr: 'outerHTML',
        value: 'Mister Johnson',
    }, {
        target: dom.$('username'),
    });

    expect($('#wrapper').text()).toBe('Mister Johnson');
});

test('Assign element outer html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    const command = {
        name: 'dom.assign',
        args: {
            id: 'username',
            attr: 'outerHTML',
            value: 'Mister Johnson',
        },
    };

    handler.processCommands(makeRequest([command]));

    expect($('#wrapper').text()).toBe('Mister Johnson');
});
