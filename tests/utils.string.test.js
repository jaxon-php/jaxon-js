const {
    utils: { string },
} = require('../dist/jaxon.module');

test('Replace single quotes with double quotes.', () => {
    expect(string.doubleQuotes("'Quoted'")).toBe('"Quoted"');
});

test('Replace double quotes with single quotes.', () => {
    expect(string.singleQuotes('"Quoted"')).toBe("'Quoted'");
});

test('Strip on prefix.', () => {
    expect(string.stripOnPrefix('onclick')).toBe('click');
});

test('Strip on prefix with capital letter.', () => {
    expect(string.stripOnPrefix('onClick')).toBe('click');
});

test('Strip on prefix with no prefix.', () => {
    expect(string.stripOnPrefix('click')).toBe('click');
});

test('Add on prefix.', () => {
    expect(string.addOnPrefix('click')).toBe('onclick');
});

test('Add on prefix with prefix.', () => {
    expect(string.addOnPrefix('onclick')).toBe('onclick');
});

test('Add on prefix with capital letter.', () => {
    expect(string.addOnPrefix('Click')).toBe('onclick');
});

test('Add on prefix with capital letter and prefix.', () => {
    expect(string.addOnPrefix('onClick')).toBe('onclick');
});

test('Replace placeholder in a string.', () => {
    expect(string.supplant('Really Mr. {name}?',
        {'name': 'Johnson'})).toBe('Really Mr. Johnson?');
});

test('Replace placeholders in a string.', () => {
    expect(string.supplant('{name} Mr. {word}!',
        {'name': 'Goodbye', 'word': 'Johnson'})).toBe('Goodbye Mr. Johnson!');
});

test('Replace inversed placeholders in a string.', () => {
    expect(string.supplant('Mr. {word}, {name}!',
        {'name': 'Goodbye', 'word': 'Johnson'})).toBe('Mr. Johnson, Goodbye!');
});
