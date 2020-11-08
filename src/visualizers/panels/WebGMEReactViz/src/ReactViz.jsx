import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Provider} from 'react-redux';
import {createStore} from 'redux';

import reducers from './containers/reducers';
import {setActiveNode, setActiveSelection, setIsActivePanel, setReadOnly, setPanelSize} from './containers/actions';
import StatefullSubTree from './containers/StatefullSubTree';
import NodeList from './components/NodeList';

export default class ReactViz extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        stateMediator: PropTypes.object.isRequired,
        initialState: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.store = createStore(reducers, this.props.initialState);

        const {stateMediator} = this.props;

        stateMediator.onActiveNodeChange = (activeNode) => {
            this.store.dispatch(setActiveNode(typeof activeNode === 'string' ? activeNode : null));
        };

        stateMediator.onActiveSelectionChange = (activeSelection) => {
            this.store.dispatch(setActiveSelection(activeSelection instanceof Array ? activeSelection : []));
        };

        stateMediator.onActivate = () => {
            this.store.dispatch(setIsActivePanel(true));
        };

        stateMediator.onDeactivate = () => {
            this.store.dispatch(setIsActivePanel(false));
        };

        stateMediator.onReadOnlyChanged = (readOnly) => {
            this.store.dispatch(setReadOnly(readOnly));
        };

        stateMediator.onResize = (width, height) => {
            this.store.dispatch(setPanelSize({width, height}));
        };

        this.store.subscribe(() => {
            const state = this.store.getState();
            if (state.isActivePanel) {
                stateMediator.setActiveNode(state.activeNode);
                stateMediator.setActiveSelection(state.activeSelection);
            }
        });
    }

    render() {
        const {gmeClient} = this.props;
        let content = <div/>;

        if (gmeClient) {
            content = (
                <StatefullSubTree gmeClient={this.props.gmeClient}>
                    <NodeList/>
                </StatefullSubTree>
            );
        }

        return (
            <Provider store={this.store}>
                {content}
            </Provider>
        );
    }
}
