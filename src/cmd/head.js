/**
 * Class: jaxon.cmd.head
 */

(function(self, handler, baseDocument) {
    /**
     * Add a reference to the specified script file if one does not already exist in the HEAD of the current document.
     *
     * @param {object} command The Response command object.
     * @param {string} command.data The URI of the file.
     *
     * @returns {true} The operation completed successfully.
     */
    self.includeScriptOnce = ({ data: src, type = 'text/javascript', elm_id }) => {
        // Check for existing script tag for this file.
        const loadedScripts = baseDocument.getElementsByTagName('script');
        // Find an existing script with the same file name
        const loadedScript = Array.from(loadedScripts)
            .find(script => script.src && script.src.indexOf(src) >= 0);
        return (loadedScript) ? true : self.includeScript({ data: src, type, elm_id });
    };

    /**
     * Adds a SCRIPT tag referencing the specified file.
     * This effectively causes the script to be loaded in the browser.
     *
     * @param {object} command The Response command object.
     * @param {string} command.data The URI of the file.
     * @param {string='text/javascript'} command.type The type of the file.
     * @param {string=} command.elm_id The script tag id.
     *
     * @returns {true} The operation completed successfully.
     */
    self.includeScript = ({ data: src, type = 'text/javascript', elm_id }) => {
        const objHead = baseDocument.getElementsByTagName('head');
        const objScript = baseDocument.createElement('script');
        objScript.src = src;
        objScript.type = type;
        if (elm_id) {
            objScript.setAttribute('id', elm_id);
        }
        objHead[0].appendChild(objScript);
        return true;
    };

    /**
     * Locates a SCRIPT tag in the HEAD of the document which references the specified file and removes it.
     *
     * @param {object} command The Response command object.
     * @param {string} command.data The URI of the file.
     * @param {string=} command.unld A function to execute.
     *
     * @returns {true} The operation completed successfully.
     */
    self.removeScript = ({ data: src, unld: unload }) => {
        const loadedScripts = baseDocument.getElementsByTagName('script');
        // Find an existing script with the same file name
        const loadedScript = Array.from(loadedScripts)
            .find(script => script.src && script.src.indexOf(src) >= 0);
        if (!loadedScript) {
            return true;
        }
        if (unload) {
            // Execute the provided unload function.
            self.execute({ data: unload, context: window });
        }
        loadedScript.parentNode.removeChild(loadedScript);
        return true;
    };

    /**
     * Add a LINK reference to the specified .css file if it does not already exist in the HEAD of the current document.
     *
     * @param {object} command The Response command object.
     * @param {string} command.data The URI of the .css file to reference.
     * @param {string='screen'} command.media The media type of the css file (print/screen/handheld,..)
     *
     * @returns {true} The operation completed successfully.
     */
    self.includeCSS = ({ data: fileName, media = 'screen' }) => {
        const oHeads = baseDocument.getElementsByTagName('head');
        const oHead = oHeads[0];
        const found = Array.from(oHead.getElementsByTagName('link'))
            .find(link => link.href.indexOf(fileName) >= 0 && link.media == media);
        if (found) {
            return true;
        }

        const oCSS = baseDocument.createElement('link');
        oCSS.rel = 'stylesheet';
        oCSS.type = 'text/css';
        oCSS.href = fileName;
        oCSS.media = media;
        oHead.appendChild(oCSS);
        return true;
    };

    /**
     * Locate and remove a LINK reference from the current document's HEAD.
     *
     * @param {object} command The Response command object.
     * @param {string} command.data The URI of the .css file.
     * @param {string='screen'} command.media The media type of the css file (print/screen/handheld,..)
     *
     * @returns {true} The operation completed successfully.
     */
    self.removeCSS = ({ data: fileName, media = 'screen' }) => {
        const oHeads = baseDocument.getElementsByTagName('head');
        const oHead = oHeads[0];
        const oLinks = oHead.getElementsByTagName('link');
        oLinks.filter(link => link.href.indexOf(fileName) >= 0 && link.media === media)
            .forEach(link => oHead.removeChild(link));
        return true;
    },

    /**
     * Attempt to detect when all .css files have been loaded once they are referenced by a LINK tag
     * in the HEAD of the current document.
     *
     * @param {object} command The Response command object.
     * @param {integer} command.prop The number of 1/10ths of a second to wait before giving up.
     * @param {object} command.response The Response object.
     *
     * @returns {true} The .css files appear to be loaded.
     * @returns {false} The .css files do not appear to be loaded and the timeout has not expired.
     */
    self.waitForCSS = (command) => {
        const oDocSS = baseDocument.styleSheets;
        const ssLoaded = oDocSS.every(styleSheet => {
            const enabled = styleSheet.cssRules.length ?? styleSheet.rules.length ?? 0;
            return enabled !== 0;
        });
        if (ssLoaded) {
            return false;
        }

        // inject a delay in the queue processing
        // handle retry counter
        const { prop: duration, response } = command;
        if (handler.retry(command, duration)) {
            handler.setWakeup(response, 10);
            return false;
        }
        // Give up, continue processing queue
        return true;
    };
})(jaxon.cmd.head, jaxon.ajax.handler, jaxon.config.baseDocument);
