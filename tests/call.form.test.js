const $ = require('jquery');
const u = require('umbrellajs');
const {
    utils: { form, types },
    parser: { query },
} = require('../dist/jaxon.module');

// Init the selector library.
query.init(u);

test('Test form with multiple select', () => {
    // Fix: https://github.com/jaxon-php/jaxon-core/issues/128
    document.body.innerHTML = `
    <div id="wrapper">
      <form id='test_form'>
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
