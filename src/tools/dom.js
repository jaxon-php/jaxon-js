jaxon.tools.dom = {
    /*
    Function: jaxon.tools.dom.$

    Shorthand for finding a uniquely named element within the document.

    Parameters:
    sId - (string):
        The unique name of the element (specified by the ID attribute), not to be confused
        with the name attribute on form elements.
        
    Returns:
    object - The element found or null.

    Note:
        This function uses the <jaxon.config.baseDocument> which allows <jaxon> to operate on the
        main window document as well as documents from contained iframes and child windows.

    See also:
        <jaxon.$> and <jxn.$>
    */
    $: function(sId) {
        if (!sId)
            return null;
        //sId not an string so return it maybe its an object.
        if (typeof sId != 'string')
            return sId;

        var oDoc = jaxon.config.baseDocument;

        var obj = oDoc.getElementById(sId);
        if (obj)
            return obj;

        if (oDoc.all)
            return oDoc.all[sId];

        return obj;
    },

    /*
    Function: jaxon.tools.dom.getBrowserHTML

    Insert the specified string of HTML into the document, then extract it.
    This gives the browser the ability to validate the code and to apply any transformations it deems appropriate.

    Parameters:
    sValue - (string):
        A block of html code or text to be inserted into the browser's document.
        
    Returns:
    The (potentially modified) html code or text.
    */
    getBrowserHTML: function(sValue) {
        var oDoc = jaxon.config.baseDocument;
        if (!oDoc.body)
            return '';

        var elWorkspace = jaxon.$('jaxon_temp_workspace');
        if (!elWorkspace) {
            elWorkspace = oDoc.createElement('div');
            elWorkspace.setAttribute('id', 'jaxon_temp_workspace');
            elWorkspace.style.display = 'none';
            elWorkspace.style.visibility = 'hidden';
            oDoc.body.appendChild(elWorkspace);
        }
        elWorkspace.innerHTML = sValue;
        var browserHTML = elWorkspace.innerHTML;
        elWorkspace.innerHTML = '';

        return browserHTML;
    },

    /*
    Function: jaxon.tools.dom.willChange

    Tests to see if the specified data is the same as the current value of the element's attribute.

    Parameters: 
    element - (string or object):
        The element or it's unique name (specified by the ID attribute)
    attribute - (string):
        The name of the attribute.
    newData - (string):
        The value to be compared with the current value of the specified element.
        
    Returns:
    true - The specified value differs from the current attribute value.
    false - The specified value is the same as the current value.
    */
    willChange: function(element, attribute, newData) {
        if ('string' == typeof element)
            element = jaxon.$(element);
        if (element) {
            var oldData = element[attribute];
            // var oldData;
            // eval('oldData=element.' + attribute);
            return (newData != oldData);
        }
        return false;
    }
};