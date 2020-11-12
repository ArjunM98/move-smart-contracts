import React, {Component} from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';

import Territory from './Territory';

const DEFAULT_OPTIONS = {
    // Array of registry names to extract - null (nodeObj.getAttributeNames).
    attributeNames: null,
    // Array of registry names to extract - null (nodeObj.getRegistryNames).
    registryNames: null,
    // Array of pointer names to extract - null is all defined pointers (nodeObj.getSetNames).
    pointerNames: null,
    // Array of set names to extract as edges - default is all defined sets (nodeObj.getSetNames).
    setNames: null,
    // Mapping from set name to set attribute name - is label: true it will be used as label for those edges.
    setMemberAttributes: {},
    // The depth of the territory, i.e. the number of levels of containment-hierarchy to display.
    depth: 10,
};

export default class SubTree extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        activeNode: PropTypes.string,
        options: PropTypes.object,
        children: PropTypes.object.isRequired,
    };

    static defaultProps = {
        activeNode: null,
        options: {},
    };

    constructor(props) {
        super(props);
        this.options = Object.assign(DEFAULT_OPTIONS, props.options);
        this.state = {
            territory: (() => {
                if (typeof this.props.activeNode === 'string') {
                    return {
                        [this.props.activeNode]: {children: this.options.depth},
                    };
                }

                return {};
            })(),
            children: {},
        };
    }

    componentWillReceiveProps(newProps) {
        const {activeNode} = newProps;

        if (newProps.options !== this.props.options) {
            this.options = Object.assign(DEFAULT_OPTIONS, newProps.options);
        }

        if (activeNode !== this.props.activeNode) {
            this.setState({
                territory: {
                    [activeNode]: {children: this.options.depth},
                },
                children: {},
            });
        }
    }

    handleEvents = (hash, loads, updates, unloads) => {
        const {gmeClient, activeNode} = this.props;
        const {options} = this;
        const updateDesc = {};
        const activeNodeObj = gmeClient.getNode(activeNode);

        if (!activeNodeObj) {
            this.setState({children: {}});
            return;
        }

        const getMembers = (nodeObj, setName) => {
            let result;
            if (nodeObj.getSetNames().includes(setName)) {
                result = nodeObj.getMemberIds(setName).map((id) => {
                    const entry = {
                        id,
                        label: undefined,
                        memberAttrs: [],
                    };

                    if (options.setMemberAttributes[setName]) {
                        options.setMemberAttributes[setName]
                            .forEach((attrEntry) => {
                                const value = nodeObj.getMemberAttribute(setName, id, attrEntry.name);
                                entry.memberAttrs.push({
                                    name: attrEntry.name,
                                    value,
                                });
                                if (attrEntry.label) {
                                    entry.label = value;
                                }
                            });
                    }

                    return entry;
                });
            }

            return result;
        };

        const getMetaTypeName = (nodeObj) => {
            const metaId = nodeObj.getMetaTypeId();

            if (metaId) {
                const metaObj = nodeObj.getNode(nodeObj.getMetaTypeId());
                return metaObj.getAttribute('name');
            }

            return 'N/A';
        };

        loads.forEach((nodeId) => {
            const nodeObj = gmeClient.getNode(nodeId);

            updateDesc[nodeId] = {
                $set: {
                    parent: nodeObj.getParentId(),
                    metaType: getMetaTypeName(nodeObj),
                    attributes: {},
                    registries: {},
                    pointers: {},
                    sets: {},
                },
            };

            (options.attributeNames || nodeObj.getAttributeNames()).forEach((name) => {
                updateDesc[nodeId].$set.attributes[name] = nodeObj.getAttribute(name);
            });

            (options.registryNames || nodeObj.getRegistryNames()).forEach((name) => {
                updateDesc[nodeId].$set.registries[name] = nodeObj.getRegistry(name);
            });

            (options.pointerNames || nodeObj.getPointerNames()).forEach((name) => {
                updateDesc[nodeId].$set.pointers[name] = nodeObj.getPointerId(name);
            });

            (options.setNames || nodeObj.getSetNames()).forEach((name) => {
                updateDesc[nodeId].$set.sets[name] = getMembers(nodeObj, name);
            });
        });

        updates.forEach((nodeId) => {
            const nodeObj = gmeClient.getNode(nodeId);
            updateDesc[nodeId] = {
                metaType: {
                    $set: getMetaTypeName(nodeObj),
                },
                attributes: {},
                registries: {},
                pointers: {},
                sets: {},
            };

            if (updateDesc[nodeId].metaType);

            (options.attributeNames || nodeObj.getAttributeNames()).forEach((name) => {
                updateDesc[nodeId].attributes[name] = {$set: nodeObj.getAttribute(name)};
            });

            (options.registryNames || nodeObj.getRegistryNames()).forEach((name) => {
                updateDesc[nodeId].registries[name] = {$set: nodeObj.getRegistry(name)};
            });

            (options.pointerNames || nodeObj.getPointerNames()).forEach((name) => {
                updateDesc[nodeId].pointers[name] = {$set: nodeObj.getPointerId(name)};
            });

            (options.setNames || nodeObj.getSetNames()).forEach((name) => {
                updateDesc[nodeId].sets[name] = {$set: getMembers(nodeObj, name)};
            });
        });

        updateDesc.$unset = unloads;

        const newState = {children: update(this.state.children, updateDesc)};

        this.setState(newState);
    };

    render() {
        const {territory, children} = this.state;

        return (
            <div style={{width: '100%', height: '100%'}}>
                <Territory
                    gmeClient={this.props.gmeClient}
                    territory={territory}
                    onUpdate={this.handleEvents}
                    onlyActualEvents
                    reuseTerritory={false}
                />
                {React.cloneElement(
                    React.Children.only(this.props.children),
                    Object.assign({}, this.props, {nodes: children}),
                )}
            </div>);
    }
}
