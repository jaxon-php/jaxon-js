jaxon.tools.string = {
    /*
    Function: jaxon.tools.string.doubleQuotes

    Replace all occurances of the single quote character with a double quote character.

    Parameters:
    haystack - The source string to be scanned.

    Returns:  false on error
    string - A new string with the modifications applied.
    */
    doubleQuotes: function(haystack) {
        if (typeof haystack == 'undefined') return false;
        return haystack.replace(new RegExp("'", 'g'), '"');
    },

    /*
    Function: jaxon.tools.string.singleQuotes

    Replace all occurances of the double quote character with a single quote character.

    haystack - The source string to be scanned.

    Returns:
    string - A new string with the modification applied.
    */
    singleQuotes: function(haystack) {
        if (typeof haystack == 'undefined') return false;
        return haystack.replace(new RegExp('"', 'g'), "'");
    },

    /*
    Function: jaxon.tools.string.stripOnPrefix

    Detect, and if found, remove the prefix 'on' from the specified string.
    This is used while working with event handlers.

    Parameters:
    sEventName - (string): The string to be modified.

    Returns:
    string - The modified string.
    */
    stripOnPrefix: function(sEventName) {
        sEventName = sEventName.toLowerCase();
        if (0 == sEventName.indexOf('on'))
            sEventName = sEventName.replace(/on/, '');

        return sEventName;
    },

    /*
    Function: jaxon.tools.string.addOnPrefix

    Detect, and add if not found, the prefix 'on' from the specified string.
    This is used while working with event handlers.

    Parameters:
    sEventName - (string): The string to be modified.

    Returns:
    string - The modified string.
    */
    addOnPrefix: function(sEventName) {
        sEventName = sEventName.toLowerCase();
        if (0 != sEventName.indexOf('on'))
            sEventName = 'on' + sEventName;

        return sEventName;
    }
};

/**
 * String functions for Jaxon
 * See http://javascript.crockford.com/remedial.html for more explanation
 */

/**
 * Substitute variables in the string
 *
 * @return string
 */
if (!String.prototype.supplant) {
    String.prototype.supplant = function(o) {
        return this.replace(
            /\{([^{}]*)\}/g,
            function(a, b) {
                const r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };
}
