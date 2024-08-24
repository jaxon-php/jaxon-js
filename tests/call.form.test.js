const {
    cmd: { body },
    utils: { dom, form, string },
} = require('../dist/jaxon.module');

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

    expect(string.typeOf(formValues)).toBe('object');
    expect(string.typeOf(formValues.multiselect)).toBe('array');
    expect(formValues.multiselect.length).toBe(2);
    expect(formValues.multiselect[0]).toBe('1');
    expect(formValues.multiselect[1]).toBe('2');
});

test('Test form with multiple select', () => {
    // Fix: https://github.com/jaxon-php/jaxon-js/issues/29
    document.body.innerHTML = `
    <div id="wrapper">
      <form id='test_form'>
        <select id="multiselect" multiple="multiple" name="multiselect">
          <option value="1">Value 1</option>
          <option value="2">Value 2</option>
          <option value="3">Value 3</option>
        </select>
      </form>
    </div>`;

    const formValues0 = form.getValues('test_form');

    expect(string.typeOf(formValues0)).toBe('object');
    expect(string.typeOf(formValues0.multiselect)).toBe('array');
    expect(formValues0.multiselect.length).toBe(0);

    body.assign({
        target: dom.$('multiselect'),
        prop: 'options[0].selected',
        data: 'true',
    });
    const formValues1 = form.getValues('test_form');

    expect(string.typeOf(formValues1)).toBe('object');
    expect(string.typeOf(formValues1.multiselect)).toBe('array');
    expect(formValues1.multiselect.length).toBe(1);
    expect(formValues1.multiselect[0]).toBe('1');

    body.assign({
        target: dom.$('multiselect'),
        prop: 'options[1].selected',
        data: 'true',
    });
    const formValues2 = form.getValues('test_form');

    expect(string.typeOf(formValues2)).toBe('object');
    expect(string.typeOf(formValues2.multiselect)).toBe('array');
    expect(formValues2.multiselect.length).toBe(2);
    expect(formValues2.multiselect[0]).toBe('1');
    expect(formValues2.multiselect[1]).toBe('2');
});
