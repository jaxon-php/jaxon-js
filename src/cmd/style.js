/**
 * Class: jaxon.cmd.style
 */

(function(self, delay, baseDocument) {
    /**
     * Add a LINK reference to the specified .css file if it does not already exist in the HEAD of the current document.
     *
     * @param {object} command The Response command object.
     * @param {string} command.data The URI of the .css file to reference.
     * @param {string='screen'} command.media The media type of the css file (print/screen/handheld,..)
     *
     * @returns {true} The operation completed successfully.
     */
    self.add = (command) => {
        command.fullName = 'includeCSS';
        const { data: fileName, media = 'screen' } = command;

        const oHeads = baseDocument.getElementsByTagName('head');
        const oHead = oHeads[0];
        const found = oHead.getElementsByTagName('link')
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
    self.remove = (command) => {
        command.fullName = 'removeCSS';
        const { data: fileName, media = 'screen' } = command;

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
        command.fullName = 'waitForCSS';

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
        if (delay.retry(command, duration)) {
            delay.setWakeup(response, 10);
            return false;
        }
        // Give up, continue processing queue
        return true;
    };
})(jaxon.cmd.style, jaxon.utils.delay, jaxon.config.baseDocument);
