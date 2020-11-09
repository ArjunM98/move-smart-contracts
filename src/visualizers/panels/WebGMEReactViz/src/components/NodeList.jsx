import React, {Component} from 'react';
import PropTypes from 'prop-types';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Collapse from '@material-ui/core/Collapse';

import StarIcon from '@material-ui/icons/Star';

export default class NodeList extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        activeNode: PropTypes.string.isRequired,
        activeSelection: PropTypes.arrayOf(PropTypes.string).isRequired,
        isActivePanel: PropTypes.bool.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
    };

    onListItemClick = (id) => {
        return (/*e*/) => {
            this.props.setActiveSelection([id]);
        };
    };

    onListItemDoubleClick = (id) => {
        return (/*e*/) => {
            this.props.setActiveNode(id);
        };
    };

    render() {
        const {activeNode, activeSelection, nodes} = this.props;

        return (
            <div style={{width: '100%', height: '100%', overflow: 'auto'}}>
                <List>
                    {Object.keys(nodes)
                        .sort((ia, ib) => {
                            if (ia > ib) {
                                return 1;
                            } else if (ia < ib) {
                                return -1;
                            }

                            return 0;
                        })
                        .map((id) => {
                            const expanded = activeSelection.includes(id);
                            return (
                                <ListItem
                                    key={id}
                                    button
                                    onClick={this.onListItemClick(id)}
                                    onDoubleClick={this.onListItemDoubleClick(id)}
                                >
                                    {activeSelection.includes(id) ? <ListItemIcon><StarIcon/></ListItemIcon> : null}
                                    <ListItemText primary={id} secondary={nodes[id].attributes.name}/>

                                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                                        <pre>{JSON.stringify(nodes[id].attributes, null, 2)}</pre>
                                        <pre>{JSON.stringify(nodes[id].registries, null, 2)}</pre>
                                        <pre>{JSON.stringify(nodes[id].pointers, null, 2)}</pre>
                                        <pre>{JSON.stringify(nodes[id].sets, null, 2)}</pre>
                                    </Collapse>
                                </ListItem>
                            )
                        })
                    }
                </List>
            </div>);
    }
}