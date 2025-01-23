/**
 * Class: jaxon.parser.attr
 *
 * Process Jaxon custom HTML attributes
 *
 * global: jaxon
 */

(function(self, event) {
    /**
     * The DOM nodes associated to Jaxon components
     *
     * @var {object}
     */
    const xComponentNodes = {};

    /**
     * The default component item name
     *
     * @var {string}
     */
    const sDefaultComponentItem = 'main';

    /**
     * Find the DOM nodes with a given attribute
     *
     * @param {Element} xContainer A DOM node
     * @param {string} sAttr The attribute to check for
     * @param {bool} bScopeIsOuter Also check the outer element
     *
     * @returns {array}
     */
    const findNodesWithAttr = (xContainer, sAttr, bScopeIsOuter) => {
        // Some js functions return nodes without the querySelectorAll() function.
        if (!xContainer.querySelectorAll) {
            return [];
        }

        // When using the outerHTML attribute, the container node may also be returned.
        const aNodes = Array.from(xContainer.querySelectorAll(`:scope [${sAttr}]`));
        return bScopeIsOuter && xContainer.hasAttribute(sAttr) ? [xContainer, ...aNodes] : aNodes;
    };

    /**
     * @param {Element} xContainer A DOM node.
     * @param {bool} bScopeIsOuter Process the outer HTML content
     *
     * @returns {void}
     */
    const setClickHandlers = (xContainer, bScopeIsOuter) =>
        findNodesWithAttr(xContainer, 'jxn-click', bScopeIsOuter)
            .forEach(xNode => {
                const oHandler = JSON.parse(xNode.getAttribute('jxn-click'));
                event.setEventHandler({ event: 'click', func: oHandler }, { target: xNode });
            });

    /**
     * @param {Element} xTarget The event handler target.
     * @param {Element} xNode The DOM node with the attributes.
     * @param {string} sAttr The event attribute name
     *
     * @returns {void}
     */
    const setEventHandler = (xTarget, xNode, sAttr) => {
        if(!xNode.hasAttribute('jxn-call'))
        {
            return;
        }

        const sEvent = xNode.getAttribute(sAttr).trim();
        const oHandler = JSON.parse(xNode.getAttribute('jxn-call'));
        if(!xNode.hasAttribute('jxn-select'))
        {
            // Set the event handler on the node.
            event.setEventHandler({ event: sEvent, func: oHandler }, { target: xTarget });
            return;
        }

        // Set the event handler on the selected child nodes.
        const sSelector = xNode.getAttribute('jxn-select').trim();
        xTarget.querySelectorAll(`:scope ${sSelector}`).forEach(xChild => {
            // Set the event handler on the child node.
            event.setEventHandler({ event: sEvent, func: oHandler }, { target: xChild });
        });
    };

    /**
     * @param {Element} xContainer A DOM node.
     * @param {bool} bScopeIsOuter Process the outer HTML content
     *
     * @returns {void}
     */
    const setEventHandlers = (xContainer, bScopeIsOuter) =>
        findNodesWithAttr(xContainer, 'jxn-on', bScopeIsOuter)
            .forEach(xNode => setEventHandler(xNode, xNode, 'jxn-on'));

    /**
     * @param {Element} xContainer A DOM node.
     * @param {bool} bScopeIsOuter Process the outer HTML content
     *
     * @returns {void}
     */
    const setTargetEventHandlers = (xContainer, bScopeIsOuter) =>
        findNodesWithAttr(xContainer, 'jxn-target', bScopeIsOuter)
            .forEach(xTarget => {
                xTarget.querySelectorAll(':scope > [jxn-event]').forEach(xNode => {
                    // Check event declarations only on direct child.
                    if (xNode.parentNode === xTarget) {
                        setEventHandler(xTarget, xNode, 'jxn-event');
                    }
                });
            });

    /**
     * @param {Element} xContainer A DOM node.
     * @param {bool} bScopeIsOuter Process the outer HTML content
     *
     * @returns {void}
     */
    const bindNodesToComponents = (xContainer, bScopeIsOuter) =>
        findNodesWithAttr(xContainer, 'jxn-bind', bScopeIsOuter)
            .forEach(xNode => {
                const sComponentName = xNode.getAttribute('jxn-bind');
                const sComponentItem = xNode.getAttribute('jxn-item') ?? sDefaultComponentItem;
                xComponentNodes[`${sComponentName}_${sComponentItem}`] = xNode;
            });

    /**
     * Process the custom attributes in a given DOM node.
     *
     * @param {Element} xContainer A DOM node.
     * @param {bool} bScopeIsOuter Process the outer HTML content
     *
     * @returns {void}
     */
    self.process = (xContainer = document, bScopeIsOuter = false) => {
        // Set event handlers on nodes
        setTargetEventHandlers(xContainer, bScopeIsOuter);
        // Set event handlers on nodes
        setEventHandlers(xContainer, bScopeIsOuter);
        // Set event handlers on nodes
        setClickHandlers(xContainer, bScopeIsOuter);
        // Attach DOM nodes to Jaxon components
        bindNodesToComponents(xContainer, bScopeIsOuter);
    };

    /**
     * Get the DOM node of a given component.
     *
     * @param {string} sComponentName The component name.
     * @param {string=} sComponentItem The component item.
     *
     * @returns {Element|null}
     */
    self.node = (sComponentName, sComponentItem = sDefaultComponentItem) => {
        const xComponent = xComponentNodes[`${sComponentName}_${sComponentItem}`] ?? null;
        return !xComponent || !xComponent.isConnected ? null : xComponent;
    };
})(jaxon.parser.attr, jaxon.cmd.event);
