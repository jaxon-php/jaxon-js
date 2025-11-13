const jq = require('jquery');
const {
    cmd: { node },
    utils: { dom, form, types },
    parser: { query },
} = require('../dist/jaxon.module');

// Init the selector library.
query.jq = jq;

test('Test empty form', () => {
    document.body.innerHTML = `
    <div id="wrapper">
      <form id="test_form">
      </form>
    </div>`;

    const formValues = form.getValues('test_form');

    expect(types.of(formValues)).toBe('object');
    expect(Object.keys(formValues).length).toBe(0);
});

test('Test form without id', () => {
  document.body.innerHTML = `
  <div id="wrapper">
    <form>
    </form>
  </div>`;

  const formValues = form.getValues('test_form');

  expect(types.of(formValues)).toBe('object');
  expect(Object.keys(formValues).length).toBe(0);
});

test('Test form with multiple select in simple var', () => {
  // Fix: https://github.com/jaxon-php/jaxon-core/issues/128
  document.body.innerHTML = `
  <div id="wrapper">
    <form id="test_form">
      <select multiple="multiple" name="multiselect">
        <option value="1" selected>Value 1</option>
        <option value="2" selected>Value 2</option>
        <option value="3">Value 3</option>
      </select>
    </form>
  </div>`;

  const formValues = form.getValues('test_form');

  expect(types.of(formValues)).toBe('object');
  expect(types.of(formValues.multiselect)).toBe('string');
  expect(formValues.multiselect).toBe('2');
});

test('Test assign command on multiple select in simple var', () => {
    // Fix: https://github.com/jaxon-php/jaxon-js/issues/29
    document.body.innerHTML = `
    <div id="wrapper">
      <form id="test_form">
        <select id="multiselect" multiple="multiple" name="multiselect">
          <option value="1">Value 1</option>
          <option value="2">Value 2</option>
          <option value="3">Value 3</option>
        </select>
      </form>
    </div>`;

    const formValues0 = form.getValues('test_form');

    expect(types.of(formValues0)).toBe('object');
    expect(formValues0.multiselect).toBe(undefined);

    node.assign({
        attr: 'options[0].selected',
        value: 'true',
    }, {
        target: dom.$('multiselect'),
    });
    const formValues1 = form.getValues('test_form');

    expect(types.of(formValues1)).toBe('object');
    expect(types.of(formValues1.multiselect)).toBe('string');
    expect(formValues1.multiselect).toBe('1');

    node.assign({
        attr: 'options[1].selected',
        value: 'true',
    }, {
        target: dom.$('multiselect'),
    });
    const formValues2 = form.getValues('test_form');

    expect(types.of(formValues2)).toBe('object');
    expect(types.of(formValues2.multiselect)).toBe('string');
    expect(formValues2.multiselect).toBe('2');
});

test('Test form with multiple select in array var', () => {
  // Fix: https://github.com/jaxon-php/jaxon-core/issues/128
  document.body.innerHTML = `
  <div id="wrapper">
    <form id="test_form">
      <select multiple="multiple" name="multiselect[]">
        <option value="1" selected>Value 1</option>
        <option value="2" selected>Value 2</option>
        <option value="3">Value 3</option>
      </select>
    </form>
  </div>`;

  const formValues = form.getValues('test_form');

  expect(types.of(formValues)).toBe('object');
  expect(types.of(formValues.multiselect)).toBe('array');
  expect(formValues.multiselect.length).toBe(2);
  expect(formValues.multiselect[0]).toBe('1');
  expect(formValues.multiselect[1]).toBe('2');
});

test('Test assign command on multiple select in array var', () => {
    // Fix: https://github.com/jaxon-php/jaxon-js/issues/29
    document.body.innerHTML = `
    <div id="wrapper">
      <form id="test_form">
        <select id="multiselect" multiple="multiple" name="multiselect[]">
          <option value="1">Value 1</option>
          <option value="2">Value 2</option>
          <option value="3">Value 3</option>
        </select>
      </form>
    </div>`;

    const formValues0 = form.getValues('test_form');

    expect(types.of(formValues0)).toBe('object');
    expect(types.of(formValues0.multiselect)).toBe('array');
    expect(formValues0.multiselect.length).toBe(0);

    node.assign({
        attr: 'options[0].selected',
        value: 'true',
    }, {
        target: dom.$('multiselect'),
    });
    const formValues1 = form.getValues('test_form');

    expect(types.of(formValues1)).toBe('object');
    expect(types.of(formValues1.multiselect)).toBe('array');
    expect(formValues1.multiselect.length).toBe(1);
    expect(formValues1.multiselect[0]).toBe('1');

    node.assign({
        attr: 'options[1].selected',
        value: 'true',
    }, {
        target: dom.$('multiselect'),
    });
    const formValues2 = form.getValues('test_form');

    expect(types.of(formValues2)).toBe('object');
    expect(types.of(formValues2.multiselect)).toBe('array');
    expect(formValues2.multiselect.length).toBe(2);
    expect(formValues2.multiselect[0]).toBe('1');
    expect(formValues2.multiselect[1]).toBe('2');
});

test('Test multiple select in nested array var', () => {
    // Fix: https://github.com/jaxon-php/jaxon-js/issues/29
    document.body.innerHTML = `
    <div id="wrapper">
      <form id="test_form">
        <select id="multiselect" multiple="multiple" name="user[roles][]">
        <option value="1" selected>Value 1</option>
        <option value="2">Value 2</option>
        <option value="3" selected>Value 3</option>
        </select>
      </form>
    </div>`;

    const formValues = form.getValues('test_form');

    expect(types.of(formValues)).toBe('object');
    expect(types.of(formValues.user)).toBe('object');
    expect(types.of(formValues.user.roles)).toBe('array');
    expect(formValues.user.roles.length).toBe(2);
    expect(formValues.user.roles[0]).toBe('1');
    expect(formValues.user.roles[1]).toBe('3');
});

test('Test form with names into brackets', () => {
  document.body.innerHTML = `
  <div id="wrapper">
    <form id="test_form">
      <input name="user[name]" value="John Doe" />
      <input name="user[email]" value="john.doe@website.com" />
      <input name="user[website]" value="john.doe.website.com" />
    </form>
  </div>`;

  const formValues = form.getValues('test_form');

  expect(types.of(formValues)).toBe('object');
  expect(types.of(formValues.user)).toBe('object');
  expect(Object.keys(formValues.user).length).toBe(3);
  expect(formValues.user.name).toBe('John Doe');
  expect(formValues.user.email).toBe('john.doe@website.com');
  expect(formValues.user.website).toBe('john.doe.website.com');
});

test('Test form with names into multiple brackets', () => {
  document.body.innerHTML = `
  <div id="wrapper">
    <form id="test_form">
      <input name="user[name][first]" value="John" />
      <input name="user[name][last]" value="Doe" />
      <input name="user[email]" value="john.doe@website.com" />
      <input name="user[website]" value="john.doe.website.com" />
    </form>
  </div>`;

  const formValues = form.getValues('test_form');

  expect(types.of(formValues)).toBe('object');
  expect(types.of(formValues.user)).toBe('object');
  expect(Object.keys(formValues.user).length).toBe(3);
  expect(types.of(formValues.user.name)).toBe('object');
  expect(Object.keys(formValues.user.name).length).toBe(2);
  expect(formValues.user.name.first).toBe('John');
  expect(formValues.user.name.last).toBe('Doe');
  expect(formValues.user.email).toBe('john.doe@website.com');
  expect(formValues.user.website).toBe('john.doe.website.com');
});

test('Test form with array field', () => {
  document.body.innerHTML = `
  <div id="wrapper">
    <form id="test_form">
      <input name="values[]" value="First value" />
      <input name="values[]" value="Second value" />
      <input name="values[]" value="Third value" />
    </form>
  </div>`;

  const formValues = form.getValues('test_form');

  expect(types.of(formValues)).toBe('object');
  expect(types.of(formValues.values)).toBe('array');
  expect(Object.keys(formValues.values).length).toBe(3);
  expect(formValues.values[0]).toBe('First value');
  expect(formValues.values[1]).toBe('Second value');
  expect(formValues.values[2]).toBe('Third value');
});

test('Test form with object with array field', () => {
  document.body.innerHTML = `
  <div id="wrapper">
    <form id="test_form">
      <input name="user[roles][]" value="First role" />
      <input name="user[perms][]" value="First perm" />
      <input name="user[roles][]" value="Second role" />
      <input name="user[perms][]" value="Second perm" />
    </form>
  </div>`;

  const formValues = form.getValues('test_form');

  expect(types.of(formValues)).toBe('object');
  expect(types.of(formValues.user)).toBe('object');
  expect(types.of(formValues.user.roles)).toBe('array');
  expect(types.of(formValues.user.perms)).toBe('array');
  expect(Object.keys(formValues.user.roles).length).toBe(2);
  expect(Object.keys(formValues.user.perms).length).toBe(2);
  expect(formValues.user.roles[0]).toBe('First role');
  expect(formValues.user.roles[1]).toBe('Second role');
  expect(formValues.user.perms[0]).toBe('First perm');
  expect(formValues.user.perms[1]).toBe('Second perm');
});
