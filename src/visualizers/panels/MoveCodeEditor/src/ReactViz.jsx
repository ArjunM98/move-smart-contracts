import React, {Component} from 'react';
import {Provider} from 'react-redux';

import Editor from '@monaco-editor/react';

export default class ReactViz extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let content = <div/>;
        content = (
            <Editor language="rust" />
        );

        return (
            <Provider store={this.store}>
                {content}
            </Provider>
        );
    }
}
