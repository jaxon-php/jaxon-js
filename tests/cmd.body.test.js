const $ = require('jquery');
const {
    cmd: { body },
    ajax: { handler },
    utils: { dom, queue },
} = require('../dist/jaxon.module');

test('Assign element inner html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    body.assign({
        id: 'username',
        target: dom.$('username'),
        prop: 'innerHTML',
        data: 'Mister Johnson',
    });

    expect($('#username').text()).toBe('Mister Johnson');
});

test('Assign element inner html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    const oQueue = queue.create(5);
    queue.push(oQueue, {
        cmd: 'as',
        id: 'username',
        prop: 'innerHTML',
        data: 'Mister Johnson',
    });

    handler.processCommands(oQueue);

    expect($('#username').text()).toBe('Mister Johnson');
});

test('Assign element outer html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    body.assign({
        id: 'username',
        target: dom.$('username'),
        prop: 'outerHTML',
        data: 'Mister Johnson',
    });

    expect($('#wrapper').text()).toBe('Mister Johnson');
});

test('Assign element outer html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    const oQueue = queue.create(5);
    queue.push(oQueue, {
        cmd: 'as',
        id: 'username',
        prop: 'outerHTML',
        data: 'Mister Johnson',
    });

    handler.processCommands(oQueue);

    expect($('#wrapper').text()).toBe('Mister Johnson');
});
