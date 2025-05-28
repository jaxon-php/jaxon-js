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

test('Test form with multiple select', () => {
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
  expect(types.of(formValues.multiselect)).toBe('array');
  expect(formValues.multiselect.length).toBe(2);
  expect(formValues.multiselect[0]).toBe('1');
  expect(formValues.multiselect[1]).toBe('2');
});

test('Test assign command on multiple select', () => {
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

test('Test form with names into brackets', () => {
  document.body.innerHTML = `
  <div id="wrapper">
    <form id="test_form">
      <input name="[user][name]" value="John Doe" />
      <input name="[user][email]" value="john.doe@website.com" />
      <input name="[user][website]" value="john.doe.website.com" />
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
