const $ = require('jquery');
const jaxon = require('../dist/jaxon.module');
const {
    ajax: { handler },
} = jaxon;
window.jaxon = jaxon;

let testValue = '';

function testFunction(newValue = 'changed') {
    testValue = newValue;
}
window.testFunction = testFunction;

test('Test function call', () => {
    testValue = '';

    handler.execute({
        cmd: 'jc',
        func: 'testFunction',
        data: [],
    });

    expect(testValue).toBe('changed');
});

test('Test function call with parameter', () => {
    testValue = '';

    handler.execute({
        cmd: 'jc',
        func: 'testFunction',
        data: ['new value'],
    });

    expect(testValue).toBe('new value');
});

test('Test function exec', () => {
    testValue = '';

    handler.execute({
        cmd: 'js',
        data: 'testFunction()',
    });

    expect(testValue).toBe('changed');
});

test('Test function exec with parameter', () => {
    testValue = '';

    handler.execute({
        cmd: 'js',
        data: 'testFunction("new value")',
    });

    expect(testValue).toBe('new value');
});
