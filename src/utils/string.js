/**
 * Class: jaxon.utils.string
 */

(function(self) {
    /*
    Function: jaxon.utils.string.doubleQuotes

    Replace all occurances of the single quote character with a double quote character.

    Parameters:
    haystack - The source string to be scanned.

    Returns:  false on error
    string - A new string with the modifications applied.
    */
    self.doubleQuotes = haystack =>
        haystack === undefined ? false : haystack.replace(new RegExp("'", 'g'), '"');

    /*
    Function: jaxon.utils.string.singleQuotes

    Replace all occurances of the double quote character with a single quote character.

    haystack - The source string to be scanned.

    Returns:
    string - A new string with the modification applied.
    */
    self.singleQuotes = haystack =>
        haystack === undefined ? false : haystack.replace(new RegExp('"', 'g'), "'");

    /*
    Function: jaxon.utils.string.stripOnPrefix

    Detect, and if found, remove the prefix 'on' from the specified string.
    This is used while working with event handlers.

    Parameters:
    sEventName - (string): The string to be modified.

    Returns:
    string - The modified string.
    */
    self.stripOnPrefix = (sEventName) => {
        sEventName = sEventName.toLowerCase();
        return sEventName.indexOf('on') === 0 ? sEventName.replace(/on/, '') : sEventName;
    };

    /*
    Function: jaxon.utils.string.addOnPrefix

    Detect, and add if not found, the prefix 'on' from the specified string.
    This is used while working with event handlers.

    Parameters:
    sEventName - (string): The string to be modified.

    Returns:
    string - The modified string.
    */
    self.addOnPrefix = (sEventName) => {
        sEventName = sEventName.toLowerCase();
        return sEventName.indexOf('on') !== 0 ? 'on' + sEventName : sEventName;
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
})(jaxon.utils.string);
