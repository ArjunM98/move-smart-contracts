import React, { useState, useEffect } from 'react';
import { Button, Container } from '@material-ui/core';
import Editor from '@monaco-editor/react';

const MoveCodeEditor = ({ gmeClient, initialState }) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [code, setCode] = useState("// Write your code here");


    // componentDidMount() sideEffect
    useEffect(() => {
        let regex = /^\/9\/[^\/]*$/g;

        if (initialState.activeNode.match(regex)) {
            const contract = gmeClient.getNode(initialState.activeNode);
            const generatedCode = contract.getAttribute("generatedMoveCode");
            const customCode = contract.getAttribute("customMoveCode");

            if (customCode) {
                setCode(customCode);
            } else if (generatedCode) {
                setCode(generatedCode)
            }
        }
        else {
            setError("This visualizer is specifically for contracts.")
        }

        setLoading(false);
    }, [])

    const handleShowGeneratedCode = () => {
        const contract = gmeClient.getNode(initialState.activeNode);
        const generatedCode = contract.getAttribute("generatedMoveCode");

        if (generatedCode) {
            setCode(generatedCode);
        } else {
            setCode("// No generated code found, run the MoveCodeGenerator plugin and press the view button again.");
        }
    };

    const handleShowSavedCode = () => {
        const contract = gmeClient.getNode(initialState.activeNode);
        const generatedCode = contract.getAttribute("customMoveCode");

        if (generatedCode) {
            setCode(generatedCode);
        } else {
            setCode("// No saved code found, write your own code and save it!");
        }
    };

    const renderContent = () => (
        error ? <h3> {error} </h3> :
            <Container>
                <h2 className="center"> Move Code Editor </h2>

                <p>
                    The code editor displays the current Move code associated with this contract.
                    Custom code can be written and saved to this contract through the "Save" button.
                    You can also run the MoveCodeGenerator plugin to autogenerate code for this contract.
                    This generated code can be viewed in the editor through the "View Generated Code" button.
                    <b> The generated code shown is based on the LAST successful plugin run. </b>
                    Saved custom code can be viewed in the editor through the "View Saved Code" button.
                    On startup, if no custom code is defined, generated code will be shown by default assuming the plugin has been ran before.
                </p>

                <Button
                    style={{ marginRight: "1rem", marginBottom: "1rem" }}
                    variant="contained"
                    color="primary"
                    size="medium"
                    onClick={handleShowSavedCode}
                >
                    View Saved Code
                </Button>

                <Button
                    style={{ marginRight: "1rem", marginBottom: "1rem" }}
                    variant="contained"
                    color="primary"
                    size="medium"
                    onClick={handleShowGeneratedCode}
                >
                    View Generated Code
                </Button>

                <Editor
                    height="65vh"
                    language="rust"
                    value={code}
                    theme="dark"
                />
            </Container>
    );

    return (
        loading ? <h2> Loading... </h2> : renderContent()
    );
}

export default MoveCodeEditor;
