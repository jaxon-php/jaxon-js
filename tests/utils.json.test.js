const $ = require('jquery');
const {
    utils: { dom, json },
} = require('../dist/jaxon.module');

// Set jQuery in the DOM util.
dom.jq = $;

test('Read str value from the DOM', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="integer">1024</span></div>`;

    const strValue = json.execute({
        calls: [{
            _type: 'selector',
            _name: '#integer'
        }, {
            _type: 'func',
            _name: 'text',
        }],
    });

    expect(strValue).toBe('1024');
});

test('Read str value from the DOM', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="integer">1024</span></div>`;

    const strValue = json.execute({
        calls: [{
            _type: 'selector',
            _name: '#integer'
        }, {
            _type: 'func',
            _name: 'html',
        }],
    });

    expect(strValue).toBe('1024');
});

test('Read int value from the DOM', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="integer">1024</span></div>`;

    const intValue = json.execute({
        calls: [{
            _type: 'selector',
            _name: '#integer'
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

    json.execute({
        calls: [{
            _type: 'selector',
            _name: '#username'
        }, {
            _type: 'func',
            _name: 'html',
            params: ['Mister Johnson'],
        }],
    });

    expect($('#username').text()).toBe('Mister Johnson');
});

// test('Assign element outer html', () => {
//     document.body.innerHTML = `<div id="wrapper"><span id="username">Feuzeu</span></div>`;

//     json.execute({
//         calls: [{
//             _type: 'selector',
//             _name: '#username'
//         }, {
//             _type: 'func',
//             _name: 'html',
//             params: ['Mister Johnson'],
//         }],
//     });

//     expect(dom.jQuery('#wrapper').text()).toBe('Mister Johnson');
// });
