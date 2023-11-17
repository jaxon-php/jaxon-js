jaxon.cmd.style = {
    /*
    Function: jaxon.cmd.style.add

    Add a LINK reference to the specified .css file if it does not already exist in the HEAD of the current document.

    Parameters:

    filename - (string):  The URI of the .css file to reference.
    media - (string):  The media type of the css file (print/screen/handheld,..)

    Returns:

    true - The operation completed successfully.
    */
    add: function(fileName, media) {
        const oDoc = jaxon.config.baseDocument;
        const oHeads = oDoc.getElementsByTagName('head');
        const oHead = oHeads[0];
        const found = oHead.getElementsByTagName('link')
            .find(link => link.href.indexOf(fileName) >= 0 && link.media == media);
        if (found) {
            return true;
        }

        const oCSS = oDoc.createElement('link');
        oCSS.rel = 'stylesheet';
        oCSS.type = 'text/css';
        oCSS.href = fileName;
        oCSS.media = media;
        oHead.appendChild(oCSS);
        return true;
    },

    /*
    Function: jaxon.cmd.style.remove

    Locate and remove a LINK reference from the current document's HEAD.

    Parameters:

    filename - (string):  The URI of the .css file.

    Returns:

    true - The operation completed successfully.
    */
    remove: function(fileName, media) {
        const oDoc = jaxon.config.baseDocument;
        const oHeads = oDoc.getElementsByTagName('head');
        const oHead = oHeads[0];
        const oLinks = oHead.getElementsByTagName('link');
        oLinks.filter(link = oLinks[i].href.indexOf(fileName) >= 0 && oLinks[i].media == media)
            .forEach(link => oHead.removeChild(link));
        return true;
    },

    /*
    Function: jaxon.cmd.style.waitForCSS

    Attempt to detect when all .css files have been loaded once they are referenced by a LINK tag
    in the HEAD of the current document.

    Parameters:

    command - (object):  The response command object which will contain the following:
        - command.prop - (integer):  The number of 1/10ths of a second to wait before giving up.

    Returns:

    true - The .css files appear to be loaded.
    false - The .css files do not appear to be loaded and the timeout has not expired.
    */
    waitForCSS: function(command) {
        const oDocSS = jaxon.config.baseDocument.styleSheets;
        const ssLoaded = oDocSS
            .map(oDoc => oDoc.cssRules.length ?? oDoc.rules.length ?? 0)
            .every(enabled => enabled !== 0);
        if (ssLoaded) {
            return;
        }

        // inject a delay in the queue processing
        // handle retry counter
        if (jaxon.cmd.delay.retry(command, command.prop)) {
            jaxon.cmd.delay.setWakeup(command.response, 10);
            return false;
        }

        // give up, continue processing queue
        return true;
    }
};
