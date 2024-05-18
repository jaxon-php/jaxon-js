const $ = require('jquery');
const {
    call: { json, query },
} = require('../dist/jaxon.module');

// Set jQuery in the DOM util.
query.jq = $;

test('Read str value from the DOM', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="integer">1024</span></div>`;

    // JQuery code: const strValue = $('#integer')->text()
    const strValue = json.execExpr({
        calls: [{
            _type: 'select',
            _name: '#integer',
        }, {
            _type: 'method',
            _name: 'text',
        }],
    });

    expect(strValue).toBe('1024');
});

test('Read str value from the DOM', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="integer">1024</span></div>`;

    // JQuery code: const strValue = $('#integer')->html()
    const strValue = json.execExpr({
        calls: [{
            _type: 'select',
            _name: '#integer',
        }, {
            _type: 'method',
            _name: 'html',
        }],
    });

    expect(strValue).toBe('1024');
});

test('Read int value from the DOM', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="integer">1024</span></div>`;

    // JQuery code: const intValue = parseInt($('#integer')->text())
    const intValue = json.execExpr({
        calls: [{
            _type: 'func',
            _name: 'parseInt',
            args: [{
                _type: 'expr',
                calls: [{
                    _type: 'select',
                    _name: '#integer',
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

    // JQuery code: const intValue = parseInt($('#integer')->text())
    const intValue = json.execExpr({
        calls: [{
            _type: 'select',
            _name: '#integer',
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

    // JQuery code: $('#username')->html('Mister Johnson')
    json.execExpr({
        calls: [{
            _type: 'select',
            _name: '#username',
        }, {
            _type: 'method',
            _name: 'html',
            args: ['Mister Johnson'],
        }],
    });

    expect($('#username').text()).toBe('Mister Johnson');
});

test('Assign element outer html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username">Feuzeu</span></div>`;

    // JQuery code: $('#username')->prop('outerHTML', 'Mister Johnson')
    json.execExpr({
        calls: [{
            _type: 'select',
            _name: '#username',
        }, {
            _type: 'method',
            _name: 'prop',
            args: ['outerHTML', 'Mister Johnson'],
        }],
    });

    expect($('#wrapper').html()).toBe('Mister Johnson');
});

test('Set an event handler', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    // Set an event handler
    // JQuery code: $('#username')->on('click', () => $('#username')->html('Mister Johnson'))
    json.execExpr({
        calls: [{
            _type: 'select',
            _name: '#username',
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
    // JQuery code: $('.username')->on('click', () => $(this)->html('Mister Johnson'))
    json.execExpr({
        calls: [{
            _type: 'select',
            _name: '.username',
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

test('Access to "window" with the selector', () => {
    expect(window.strValue).toBe(undefined);

    json.execExpr({
        calls: [{
            _type: 'select',
            _name: 'window',
        }, {
            _type: 'attr',
            _name: 'strValue',
            value: '1024',
        }],
    });

    expect(window.strValue).toBe('1024');
});
