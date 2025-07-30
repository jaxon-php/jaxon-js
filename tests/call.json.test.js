const jq = require('jquery');
const {
    parser: { call, query },
} = require('../dist/jaxon.module');

// Init the selector library.
query.jq = jq;

test('Read str value from the DOM', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="integer">1024</span></div>`;

    // Javascript code: const strValue = $('#integer')->text()
    const strValue = call.execExpr({
        calls: [{
            _type: 'select',
            _name: '#integer',
            mode: 'jq',
        }, {
            _type: 'func',
            _name: 'text',
        }],
    });

    expect(strValue).toBe('1024');
});

test('Read str value from the DOM', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="integer">1024</span></div>`;

    // Javascript code: const strValue = $('#integer')->html()
    const strValue = call.execExpr({
        calls: [{
            _type: 'select',
            _name: '#integer',
            mode: 'jq',
        }, {
            _type: 'func',
            _name: 'html',
        }],
    });

    expect(strValue).toBe('1024');
});

test('Read int value from the DOM', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="integer">1024</span></div>`;

    // Javascript code: const intValue = parseInt(query.jq('#integer')->text())
    const intValue = call.execExpr({
        calls: [{
            _type: 'func',
            _name: 'parseInt',
            args: [{
                _type: 'expr',
                calls: [{
                    _type: 'select',
                    _name: '#integer',
                    mode: 'jq',
                }, {
                    _type: 'func',
                    _name: 'text',
                }]
            }],
        }],
    });

    expect(intValue).toBe(1024);
});

test('Read int value from the DOM, with the toInt() "method"', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="integer">1024</span></div>`;

    // Javascript code: const intValue = parseInt(query.jq('#integer')->text())
    const intValue = call.execExpr({
        calls: [{
            _type: 'select',
            _name: '#integer',
            mode: 'jq',
        }, {
            _type: 'func',
            _name: 'text',
        }, {
            _type: 'func',
            _name: 'toInt',
        }],
    });

    expect(intValue).toBe(1024);
});

test('Assign element inner html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    // Javascript code: $('#username')->html('Mister Johnson')
    call.execExpr({
        calls: [{
            _type: 'select',
            _name: '#username',
            mode: 'jq',
        }, {
            _type: 'func',
            _name: 'html',
            args: ['Mister Johnson'],
        }],
    });

    expect(query.jq('#username').text()).toBe('Mister Johnson');
});

// test('Assign element outer html', () => {
//     document.body.innerHTML = `<div id="wrapper"><span id="username">Feuzeu</span></div>`;

//     // Javascript code: $('#username')->prop('outerHTML', 'Mister Johnson')
//     call.execExpr({
//         calls: [{
//             _type: 'select',
//             _name: '#username',
//             mode: 'jq',
//         }, {
//             _type: 'func',
//             _name: 'prop',
//             args: ['outerHTML', 'Mister Johnson'],
//         }],
//     });

//     expect(query.jq('#wrapper').html()).toBe('Mister Johnson');
// });

test('Set an event handler', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    // Set an event handler
    // Javascript code: $('#username')->on('click', () => $('#username')->html('Mister Johnson'))
    call.execExpr({
        calls: [{
            _type: 'select',
            _name: '#username',
            mode: 'jq',
        }, {
            _type: 'event',
            _name: 'click',
            mode: 'jq',
            func: {
                _type: 'expr',
                calls: [{
                    _type: 'select',
                    _name: '#username',
                    mode: 'jq',
                }, {
                    _type: 'func',
                    _name: 'html',
                    args: ['Mister Johnson'],
                }],
            },
        }],
    });

    expect(query.jq('#username').text()).toBe('');

    // Trigger the event handler
    query.jq('#username').trigger('click');

    expect(query.jq('#username').text()).toBe('Mister Johnson');
});

test('Use "this" in an event handler', () => {
    document.body.innerHTML = `<div id="wrapper"><span class="username"></span></div>`;

    // Set an event handler
    // Javascript code: $('.username')->on('click', () => $(this)->html('Mister Johnson'))
    call.execExpr({
        calls: [{
            _type: 'select',
            _name: '.username',
            mode: 'jq',
        }, {
            _type: 'event',
            _name: 'click',
            mode: 'jq',
            func: {
                _type: 'expr',
                calls: [{
                    _type: 'select',
                    _name: 'this',
                    mode: 'jq',
                }, {
                    _type: 'func',
                    _name: 'html',
                    args: ['Mister Johnson'],
                }],
            },
        }],
    });

    expect(query.jq('.username').text()).toBe('');

    // Trigger the event
    query.jq('.username').trigger('click');

    expect(query.jq('.username').text()).toBe('Mister Johnson');
});

test('Get value from an object in an event handler', () => {
    document.body.innerHTML = `<div id="wrapper"><span class="username"></span></div>`;

    // Javascript code: user.name = 'Mister Johnson'
    call.execExpr({
        calls: [{
            _type: 'attr',
            _name: 'user',
            value: { name: 'Mister Johnson' },
        }],
    });

    // Javascript code: const username = user.name
    const username = call.execExpr({
        calls: [{
            _type: 'attr',
            _name: 'user',
        }, {
            _type: 'attr',
            _name: 'name',
        }],
    });

    expect(username).toBe('Mister Johnson');

    // Set an event handler
    // Javascript code: $('.username')->on('click', () => $(this)->html(user.name))
    call.execExpr({
        calls: [{
            _type: 'select',
            _name: '.username',
            mode: 'jq',
        }, {
            _type: 'event',
            _name: 'click',
            mode: 'jq',
            func: {
                _type: 'expr',
                calls: [{
                    _type: 'select',
                    _name: 'this',
                    mode: 'jq',
                }, {
                    _type: 'func',
                    _name: 'html',
                    args: [{
                        _type: 'expr',
                        calls: [{
                            _type: 'attr',
                            _name: 'user',
                        }, {
                            _type: 'attr',
                            _name: 'name',
                        }],
                    }],
                }],
            },
        }],
    });

    expect(query.jq('.username').text()).toBe('');

    // Trigger the event
    query.jq('.username').trigger('click');

    expect(query.jq('.username').text()).toBe('Mister Johnson');
});

test('Access to undefined vars', () => {
    expect(window.defValue).toBe(undefined);

    // Javascript code: const undefValue1 = window.defValue
    const undefValue1 = call.execExpr({
        calls: [{
            _type: 'attr',
            _name: 'window',
        }, {
            _type: 'attr',
            _name: 'defValue',
        }],
    });

    expect(undefValue1).toBe(undefined);

    // Javascript code: window.defValue = '1024'
    call.execExpr({
        calls: [{
            _type: 'attr',
            _name: 'window',
        }, {
            _type: 'attr',
            _name: 'defValue',
            value: '1024',
        }],
    });

    expect(window.defValue).toBe('1024');

    // Javascript code: const defValue = window.defValue
    const defValue = call.execExpr({
        calls: [{
            _type: 'attr',
            _name: 'window',
        }, {
            _type: 'attr',
            _name: 'defValue',
        }],
    });

    expect(defValue).toBe('1024');

    // Javascript code: const undefValue2 = window.defValue.intValue
    const undefValue2 = call.execExpr({
        calls: [{
            _type: 'attr',
            _name: 'window',
        }, {
            _type: 'attr',
            _name: 'defValue',
        }, {
            _type: 'attr',
            _name: 'intValue',
        }],
    });

    expect(undefValue2).toBe(undefined);

    // Javascript code: const undefValue3 = window.intValue.defValue
    const undefValue3 = call.execExpr({
        calls: [{
            _type: 'attr',
            _name: 'window',
        }, {
            _type: 'attr',
            _name: 'intValue',
        }, {
            _type: 'attr',
            _name: 'defValue',
        }],
    });

    expect(undefValue3).toBe(undefined);
});

test('Access to "global" vars', () => {
    expect(window.strValue).toBe(undefined);

    // Javascript code: window.strValue = '1024'
    call.execExpr({
        calls: [{
            _type: 'attr',
            _name: 'window',
        }, {
            _type: 'attr',
            _name: 'strValue',
            value: '1024',
        }],
    });

    expect(window.strValue).toBe('1024');

    // Javascript code: const strValue = window.strValue
    const strCallValue = call.execCall({
        _type: 'attr',
        _name: 'strValue',
    });

    expect(strCallValue).toBe('1024');

    // Javascript code: const strValue = window.strValue
    const strExprValue = call.execExpr({
        calls: [{
            _type: 'attr',
            _name: 'strValue',
        }],
    });

    expect(strExprValue).toBe('1024');

    // Javascript code: const intValue = parseInt(window.strValue)
    const intValue = call.execExpr({
        calls: [{
            _type: 'func',
            _name: 'parseInt',
            args: [{
                _type: 'expr',
                calls: [{
                    _type: 'attr',
                    _name: 'strValue',
                }],
            }],
        }],
    });

    expect(intValue).toBe(1024);
});
