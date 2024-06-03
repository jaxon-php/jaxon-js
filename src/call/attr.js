/**
 * Class: jaxon.call.attr
 *
 * Process Jaxon custom HTML attributes
 */

(function(self, event) {
    /**
     * The DOM nodes associated to Jaxon components
     *
     * @var {object}
     */
    const xComponentNodes = {};

    /**
     * The DOM nodes associated to Jaxon components
     *
     * @var {string}
     */
    const sDefaultComponentItem = 'main';

    /**
     * Process the custom attributes in a given DOM node.
     *
     * @param {Element} xContainer The DOM node.
     *
     * @returns {void}
     */
    self.process = (xContainer = document) => {
        // Set event handlers on nodes
        const aEvents = xContainer.querySelectorAll(':scope [jxn-on]');
        aEvents.forEach(xNode => {
            if(!xNode.hasAttribute('jxn-func'))
            {
                return;
            }
            const sEvent = xNode.getAttribute('jxn-on');
            const oHandler = JSON.parse(xNode.getAttribute('jxn-func'));
            event.setEventHandler({ target: xNode, event: sEvent, func: oHandler });
            xNode.removeAttribute('jxn-on');
            xNode.removeAttribute('jxn-func');
        });

        // Associate DOM nodes to Jaxon components
        const aComponents = xContainer.querySelectorAll(':scope [jxn-component]');
        aComponents.forEach(xNode => {
            // if(!xNode.hasAttribute('jxn-item'))
            // {
            //     return;
            // }
            const sComponentName = xNode.getAttribute('jxn-component');
            const sComponentItem = xNode.getAttribute('jxn-item') ?? sDefaultComponentItem;
            xComponentNodes[`${sComponentName}_${sComponentItem}`] = xNode;
            xNode.removeAttribute('jxn-component');
        });
    };

    /**
     * Get the DOM node of a given component.
     *
     * @param {string} sComponentName The component name.
     * @param {string|} sComponentItem The component item.
     *
     * @returns {Element|null}
     */
    self.node = (sComponentName, sComponentItem = sDefaultComponentItem) =>
        xComponentNodes[`${sComponentName}_${sComponentItem}`] ?? null;
})(jaxon.call.attr, jaxon.cmd.event);
