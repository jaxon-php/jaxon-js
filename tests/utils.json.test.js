const $ = require('jquery');
const {
    utils: { json },
} = require('../dist/jaxon.module');

test('Assign element inner html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    json.execute({
        calls: [{
            _type: 'selector',
            _name: 'username'
        }, {
            _type: 'attr',
            _name: 'innerHTML',
            value: 'Mister Johnson',
        }],
    });

    expect($('#username').text()).toBe('Mister Johnson');
});

test('Assign element outer html', () => {
    document.body.innerHTML = `<div id="wrapper"><span id="username"></span></div>`;

    json.execute({
        calls: [{
            _type: 'selector',
            _name: 'username'
        }, {
            _type: 'attr',
            _name: 'outerHTML',
            value: 'Mister Johnson',
        }],
    });

    expect($('#wrapper').text()).toBe('Mister Johnson');
});
