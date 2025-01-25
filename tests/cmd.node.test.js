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

test('Bind a node to a component', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    const bindCommand = {
        name: 'node.bind',
        args: {
            id: 'username',
            component: {
                name: 'Component',
            },
        },
    };
    const assignCommand = {
        name: 'node.assign',
        args: {
            attr: 'innerHTML',
            value: 'Mister Johnson',
        },
        component: {
            name: 'Component',
        },
    };

    handler.processCommands(makeRequest([bindCommand, assignCommand]));

    expect(query.jq('#wrapper').text()).toBe('Mister Johnson');
});

test('Bind a node to a component with empty item', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    const bindCommand = {
        name: 'node.bind',
        args: {
            id: 'username',
            component: {
                name: 'Component',
                item: '',
            },
        },
    };
    const assignCommand = {
        name: 'node.assign',
        args: {
            attr: 'innerHTML',
            value: 'Mister Johnson',
        },
        component: {
            name: 'Component',
        },
    };

    handler.processCommands(makeRequest([bindCommand, assignCommand]));

    expect(query.jq('#wrapper').text()).toBe('Mister Johnson');
});

test('Bind a node to a component with item', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    const bindCommand = {
        name: 'node.bind',
        args: {
            id: 'username',
            component: {
                name: 'Component',
                item: 'item',
            },
        },
    };
    const assignCommand = {
        name: 'node.assign',
        args: {
            attr: 'innerHTML',
            value: 'Mister Johnson',
        },
        component: {
            name: 'Component',
            item: 'item',
        },
    };

    handler.processCommands(makeRequest([bindCommand, assignCommand]));

    expect(query.jq('#wrapper').text()).toBe('Mister Johnson');
});
