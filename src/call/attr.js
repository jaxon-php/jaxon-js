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
     * The commands to check for changes
     *
     * @var {array}
     */
    const aCommands = ['dom.assign', 'dom.append', 'dom.prepend', 'dom.replace'];

    /**
     * The attributes to check for changes
     *
     * @var {array}
     */
    const aAttributes = ['innerHTML', 'outerHTML'];

    /**
     * Check if a the attributes on a targeted node must be processed after a command is executed.
     *
     * @param {Element} xTarget A DOM node.
     * @param {string} sCommand The command name.
     * @param {string} sAttribute The attribute name.
     *
     * @returns {void}
     */
    self.changed = (xTarget, sCommand, sAttribute) => (xTarget) &&
        aAttributes.some(sVal => sVal === sAttribute) &&
        aCommands.some(sVal => sVal === sCommand);

    /**
     * @param {Element} xNode A DOM node.
     *
     * @returns {void}
     */
    const setEventHandlers = (xNode) => {
        const sEvent = xNode.getAttribute('jxn-on');
        const oHandler = JSON.parse(xNode.getAttribute('jxn-func'));
        if(!xNode.hasAttribute('jxn-select'))
        {
            // Set the event handler on the node.
            event.setEventHandler({ target: xNode, event: sEvent, func: oHandler });
            return;
        }
        // Set the event handler on the selected children nodes.
        const sSelector = xNode.getAttribute('jxn-select');
        const aChildren = xNode.querySelectorAll(`:scope ${sSelector}`);
        aChildren.forEach(xChild => {
            // Set the event handler on the child node.
            event.setEventHandler({ target: xChild , event: sEvent, func: oHandler });
        });
    };

    /**
     * Process the custom attributes in a given DOM node.
     *
     * @param {Element} xContainer A DOM node.
     *
     * @returns {void}
     */
    self.process = (xContainer = document) => {
        // Set event handlers on nodes
        const aEvents = xContainer.querySelectorAll(':scope [jxn-on]');
        aEvents.forEach(xNode => {
            if(xNode.hasAttribute('jxn-func'))
            {
                setEventHandlers(xNode);
            }
            xNode.removeAttribute('jxn-on');
            xNode.removeAttribute('jxn-func');
            xNode.removeAttribute('jxn-select');
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
