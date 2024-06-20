const $ = require('jquery');
const u = require('umbrellajs');
const {
    parser: { call, query },
} = require('../dist/jaxon.module');

// Init the selector library.
query.init(u);

test('Read str value from the DOM', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="integer">1024</span></div>`;

    // Javascript code: const strValue = $('#integer')->text()
    const strValue = call.execExpr({
        calls: [{
            _type: 'select',
            _name: '#integer',
            mode: 'jq',
        }, {
            _type: 'method',
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
            _type: 'method',
            _name: 'html',
        }],
    });

    expect(strValue).toBe('1024');
});

test('Read int value from the DOM', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="integer">1024</span></div>`;

    // Javascript code: const intValue = parseInt($('#integer')->text())
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
                    _type: 'method',
                    _name: 'text',
                }]
            }],
        }],
    });

    expect(intValue).toBe(1024);
});

test('Read int value from the DOM, with the toInt() "method"', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="integer">1024</span></div>`;

    // Javascript code: const intValue = parseInt($('#integer')->text())
    const intValue = call.execExpr({
        calls: [{
            _type: 'select',
            _name: '#integer',
            mode: 'jq',
        }, {
            _type: 'method',
            _name: 'text',
        }, {
            _type: 'method',
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
            _type: 'method',
            _name: 'html',
            args: ['Mister Johnson'],
        }],
    });

    expect($('#username').text()).toBe('Mister Johnson');
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
//             _type: 'method',
//             _name: 'prop',
//             args: ['outerHTML', 'Mister Johnson'],
//         }],
//     });

//     expect($('#wrapper').html()).toBe('Mister Johnson');
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
            func: {
                _type: 'expr',
                calls: [{
                    _type: 'select',
                    _name: '#username',
                }, {
                    _type: 'method',
                    _name: 'html',
                    args: ['Mister Johnson'],
                }],
            },
        }],
    });

    expect($('#username').text()).toBe('');

    // Trigger the event handler
    $('#username').trigger('click');

    expect($('#username').text()).toBe('Mister Johnson');
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
            func: {
                _type: 'expr',
                calls: [{
                    _type: 'select',
                    _name: 'this'
                }, {
                    _type: 'method',
                    _name: 'html',
                    args: ['Mister Johnson'],
                }],
            },
        }],
    });

    expect($('.username').text()).toBe('');

    // Trigger the event
    $('.username').trigger('click');

    expect($('.username').text()).toBe('Mister Johnson');
});

test('Access to undefined vars', () => {
    expect(window.defValue).toBe(undefined);

    // Javascript code: const undefValue1 = window.defValue
    const undefValue1 = call.execExpr({
        calls: [{
            _type: 'gvar',
            _name: 'defValue',
        }],
    });

    expect(undefValue1).toBe(undefined);

    // Javascript code: window.defValue = '1024'
    call.execExpr({
        calls: [{
            _type: 'gvar',
            _name: 'defValue',
            value: '1024',
        }],
    });

    expect(window.defValue).toBe('1024');

    // Javascript code: const defValue = window.defValue
    const defValue = call.execExpr({
        calls: [{
            _type: 'gvar',
            _name: 'defValue',
        }],
    });

    expect(defValue).toBe('1024');

    // Javascript code: const undefValue2 = window.defValue.intValue
    const undefValue2 = call.execExpr({
        calls: [{
            _type: 'gvar',
            _name: 'defValue',
        },{
            _type: 'attr',
            _name: 'intValue',
        }],
    });

    expect(undefValue2).toBe(undefined);

    // Javascript code: const undefValue3 = window.intValue.defValue
    const undefValue3 = call.execExpr({
        calls: [{
            _type: 'gvar',
            _name: 'intValue',
        },{
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
            _type: 'gvar',
            _name: 'strValue',
            value: '1024',
        }],
    });

    expect(window.strValue).toBe('1024');

    // Javascript code: const strValue = window.strValue
    const strValue = call.execExpr({
        calls: [{
            _type: 'attr',
            _name: 'strValue',
        }],
    });

    expect(strValue).toBe('1024');

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
