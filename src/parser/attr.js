/**
 * Class: jaxon.parser.attr
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
     * @param {Element} xContainer A DOM node.
     *
     * @returns {void}
     */
    const setClickHandlers = (xContainer) => {
        xContainer.querySelectorAll(':scope [jxn-click]').forEach(xNode => {
            const oHandler = JSON.parse(xNode.getAttribute('jxn-click'));
            event.setEventHandler({ event: 'click', func: oHandler }, { target: xNode });

            xNode.removeAttribute('jxn-click');
        });
    };

    /**
     * @param {Element} xTarget The event handler target.
     * @param {Element} xNode The DOM node with the attributes.
     * @param {string} sAttr The event attribute name
     *
     * @returns {void}
     */
    const setEventHandler = (xTarget, xNode, sAttr) => {
        if(!xNode.hasAttribute('jxn-func'))
        {
            return;
        }

        const sEvent = xNode.getAttribute(sAttr).trim();
        const oHandler = JSON.parse(xNode.getAttribute('jxn-func'));
        if(!xNode.hasAttribute('jxn-select'))
        {
            // Set the event handler on the node.
            event.setEventHandler({ event: sEvent, func: oHandler }, { target: xTarget });
            return;
        }

        // Set the event handler on the selected children nodes.
        const sSelector = xNode.getAttribute('jxn-select').trim();
        xTarget.querySelectorAll(`:scope ${sSelector}`).forEach(xChild => {
            // Set the event handler on the child node.
            event.setEventHandler({ event: sEvent, func: oHandler }, { target: xChild });
        });
    };

    /**
     * @param {Element} xContainer A DOM node.
     *
     * @returns {void}
     */
    const setEventHandlers = (xContainer) => {
        xContainer.querySelectorAll(':scope [jxn-on]').forEach(xNode => {
            setEventHandler(xNode, xNode, 'jxn-on');

            xNode.removeAttribute('jxn-on');
            xNode.removeAttribute('jxn-func');
            xNode.removeAttribute('jxn-select');
        });
    };

    /**
     * @param {Element} xContainer A DOM node.
     *
     * @returns {void}
     */
    const setParentEventHandlers = (xContainer) => {
        xContainer.querySelectorAll(':scope [jxn-target]').forEach(xTarget => {
            xTarget.querySelectorAll(':scope [jxn-event]').forEach(xNode => {
                // Check event declarations only on direct child.
                if (xNode.parentNode === xTarget) {
                    setEventHandler(xTarget, xNode, 'jxn-event');

                    xTarget.removeChild(xNode);
                }
            });

            xTarget.removeAttribute('jxn-target');
        });
    };

    /**
     * @param {Element} xContainer A DOM node.
     *
     * @returns {void}
     */
    const attachComponents = (xContainer) => {
        xContainer.querySelectorAll(':scope [jxn-show]').forEach(xNode => {
            const sComponentName = xNode.getAttribute('jxn-show');
            const sComponentItem = xNode.getAttribute('jxn-item') ?? sDefaultComponentItem;
            xComponentNodes[`${sComponentName}_${sComponentItem}`] = xNode;

            xNode.removeAttribute('jxn-show');
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
        setParentEventHandlers(xContainer);

        // Set event handlers on nodes
        setEventHandlers(xContainer);

        // Set event handlers on nodes
        setClickHandlers(xContainer);

        // Attach DOM nodes to Jaxon components
        attachComponents(xContainer)
    };

    /**
     * Get the DOM node of a given component.
     *
     * @param {string} sComponentName The component name.
     * @param {string=} sComponentItem The component item.
     *
     * @returns {Element|null}
     */
    self.node = (sComponentName, sComponentItem = sDefaultComponentItem) =>
        xComponentNodes[`${sComponentName}_${sComponentItem}`] ?? null;
})(jaxon.parser.attr, jaxon.cmd.event);
