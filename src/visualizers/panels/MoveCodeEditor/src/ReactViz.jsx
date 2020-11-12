import React, {Component} from 'react';
import {Provider} from 'react-redux';

import Editor from '@monaco-editor/react';

export default class ReactViz extends Component {
  

    render() {
        let content = (
            <Editor 
                language="rust"
                value={"// write your code here"}
            />
        );

        return (
            <Provider store={this.store}>
                {content}
            </Provider>
        );
    }
}
