const jq = require('jquery');
const {
    config,
    cmd: { node },
    ajax: { command: handler },
    utils: { dom, queue },
    parser: { query },
} = require('../dist/jaxon.module');

// Init the selector library.
query.jq = jq;

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

    node.assign({
        attr: 'innerHTML',
        value: 'Mister Johnson',
    }, {
        target: dom.$('username'),
    });

    expect(query.jq('#username').text()).toBe('Mister Johnson');
});

test('Assign element inner html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    const command = {
        name: 'node.assign',
        args: {
            id: 'username',
            attr: 'innerHTML',
            value: 'Mister Johnson',
        },
    };

    handler.processCommands(makeRequest([command]));

    expect(query.jq('#username').text()).toBe('Mister Johnson');
});

test('Assign element outer html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    node.assign({
        attr: 'outerHTML',
        value: 'Mister Johnson',
    }, {
        target: dom.$('username'),
        queue: queue.create(5),
    });

    expect(query.jq('#wrapper').text()).toBe('Mister Johnson');
});

test('Assign element outer html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    const command = {
        name: 'node.assign',
        args: {
            id: 'username',
            attr: 'outerHTML',
            value: 'Mister Johnson',
        },
    };

    handler.processCommands(makeRequest([command]));

    expect(query.jq('#wrapper').text()).toBe('Mister Johnson');
});
