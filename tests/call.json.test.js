const $ = require('jquery');
const {
    call: { json, query },
} = require('../dist/jaxon.module');

// Set jQuery in the DOM util.
query.jq = $;

test('Read str value from the DOM', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="integer">1024</span></div>`;

    const strValue = json.execExpr({
        calls: [{
            _type: 'select',
            _name: '#integer'
        }, {
            _type: 'method',
            _name: 'text',
        }],
    });

    expect(strValue).toBe('1024');
});

test('Read str value from the DOM', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="integer">1024</span></div>`;

    const strValue = json.execExpr({
        calls: [{
            _type: 'select',
            _name: '#integer'
        }, {
            _type: 'method',
            _name: 'html',
        }],
    });

    expect(strValue).toBe('1024');
});

test('Read int value from the DOM', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="integer">1024</span></div>`;

    const intValue = json.execExpr({
        calls: [{
            _type: 'select',
            _name: '#integer'
        }, {
            _type: 'method',
            _name: 'text',
        }, {
            _type: 'func',
            _name: 'toInt',
            args: [{ _type: '_', _name: 'this' }],
        }],
    });

    expect(intValue).toBe(1024);
});

test('Assign element inner html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    json.execExpr({
        calls: [{
            _type: 'select',
            _name: '#username'
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

//     json.execExpr({
//         calls: [{
//             _type: 'select',
//             _name: '#username'
//         }, {
//             _type: 'method',
//             _name: 'html',
//             args: ['Mister Johnson'],
//         }],
//     });

//     expect(dom.jQuery('#wrapper').text()).toBe('Mister Johnson');
// });
