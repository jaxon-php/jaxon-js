const $ = require('jquery');
const u = require('umbrellajs');
const {
    cmd: { body },
    ajax: { handler },
    utils: { dom, queue },
    parser: { query },
} = require('../dist/jaxon.module');

// Init the selector library.
query.init(u);

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

    const oQueue = queue.create(5);
    queue.push(oQueue, {
        command: {
            name: 'dom.assign',
            args: {
                id: 'username',
                attr: 'innerHTML',
                value: 'Mister Johnson',
            },
        },
    });

    handler.processCommands(oQueue);

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

    const oQueue = queue.create(5);
    queue.push(oQueue, {
        command: {
            name: 'dom.assign',
            args: {
                id: 'username',
                attr: 'outerHTML',
                value: 'Mister Johnson',
            },
        },
    });

    handler.processCommands(oQueue);

    expect($('#wrapper').text()).toBe('Mister Johnson');
});
