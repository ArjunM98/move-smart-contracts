import React, { Component } from 'react';
import { Provider } from 'react-redux';

export default class ReactViz extends Component {
    render() {
        return (
            <Provider store={this.store}>
                <header>Verification Properties</header>
            </Provider>
        );
    }
}
