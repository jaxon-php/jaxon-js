const $ = require('jquery');
const jaxon = require('../dist/jaxon.module');
const {
    ajax: { handler },
    utils: { queue },
} = jaxon;
window.jaxon = jaxon;

let testValue = '';

function testFunction(newValue = 'changed') {
    testValue = newValue;
}
window.testFunction = testFunction;

test('Test function call', () => {
    testValue = '';

    const oQueue = queue.create(5);
    queue.push(oQueue, {
        cmd: 'jc',
        func: 'testFunction',
        data: [],
    });

    handler.processCommands(oQueue);

    expect(testValue).toBe('changed');
});

test('Test function call with parameter', () => {
    testValue = '';

    const oQueue = queue.create(5);
    queue.push(oQueue, {
        cmd: 'jc',
        func: 'testFunction',
        data: ['new value'],
    });

    handler.processCommands(oQueue);

    expect(testValue).toBe('new value');
});

test('Test function exec', () => {
    testValue = '';

    const oQueue = queue.create(5);
    queue.push(oQueue, {
        cmd: 'js',
        data: 'testFunction()',
    });

    handler.processCommands(oQueue);

    expect(testValue).toBe('changed');
});

test('Test function exec with parameter', () => {
    testValue = '';

    const oQueue = queue.create(5);
    queue.push(oQueue, {
        cmd: 'js',
        data: 'testFunction("new value")',
    });

    handler.processCommands(oQueue);

    expect(testValue).toBe('new value');
});
