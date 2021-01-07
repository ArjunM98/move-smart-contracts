import React, { useState, useReducer, useEffect } from 'react';
import { Container, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';
import Template from './components/Template';

const schemaOne = (a = "[input]", b = "[input]") => `${a} cannot happen after ${b} `;
const schemaTwo = (a = "[input]", b = "[input]") => `${a} can only happen after ${b} `;
const schemaThree = (a = "[input]", b = "[input]", c = "[input]") => `If ${a} happens, ${b} can only happen after ${c} happens`;
const schemaFour = (a = "[input]", b = "[input]") => `${a} will eventually happen after ${b} happens`;


const reducer = (state, action) => {
    // Even though the arrays are modified, a new state object is created
    // to force a render, otherwise according to React the state object was not updated (shallow check)
    const newState = { ...state };

    switch (action.type) {
        case 'update':
            if (action.data == null) {
                return {
                    typeOne: [],
                    typeTwo: [],
                    typeThree: [],
                    typeFour: []
                };
            }
            else {
                return action.data;
            }
        case 'push':
            newState[action.propertyType].push(action.data);
            return newState;
        case 'remove':
            newState[action.propertyType].splice(action.data, 1);
            return newState;
    }
}

const updateAction = (properties) => (
    {
        type: 'update',
        data: properties
    }
)

const pushAction = (rule, propertyType) => (
    {
        type: 'push',
        propertyType,
        data: rule
    }
);

const deleteAction = (index, propertyType) => (
    {
        type: 'remove',
        propertyType,
        data: index
    }
);

const VerificationProperties = ({ gmeClient, initialState }) => {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [properties, dispatch] = useReducer(reducer, {
        typeOne: [],
        typeTwo: [],
        typeThree: [],
        typeFour: []
    });

    // Handlers
    const handleUpdate = (rule, propertyType) => {
        dispatch(pushAction(rule, propertyType))
    }

    const handleRemove = (index, propertyType) => {
        dispatch(deleteAction(index, propertyType))
    }

    // componentDidMount() sideEffect
    useEffect(() => {
        let regex = /^\/9\/[^\/]*$/g;

        if (initialState.activeNode.match(regex)) {
            const contract = gmeClient.getNode(initialState.activeNode);
            const initialProperties = contract.getAttribute("ctlProperties");
            dispatch(updateAction(initialProperties));
        }
        else {
            setError("This visualizer is specifically for contracts.")
        }

        setLoading(false);
    }, [])

    // componentDidUpdate() sideEffect
    useEffect(() => {
        gmeClient.setAttribute(initialState.activeNode, "ctlProperties", properties, "Modification through visualizer");
    }, [properties])

    const renderContent = () => (
        error ? <h3> {error} </h3> :
            <Container style={{ overflowY: "scroll", height: "100%" }}>
                <h2 className="center">Verification Properties</h2>

                <div>
                    <h3>Add Properties</h3>

                    <p>
                        The properties defined here will be used as part of the verification process.
                        An action refers to a transition (name) defined on the contract.
                        For a given input, use the "|" operator to specify "or" clauses, for example "A|B".
                    </p>

                    <Template
                        header="Type 1"
                        schema={schemaOne()}
                        inputName="Action"
                        submitCallback={(rule) => handleUpdate(rule, "typeOne")}
                    />
                    <Template
                        header="Type 2"
                        schema={schemaTwo()}
                        inputName="Action"
                        submitCallback={(rule) => handleUpdate(rule, "typeTwo")}
                    />
                    <Template
                        header="Type 3"
                        schema={schemaThree()}
                        inputName="Action"
                        submitCallback={(rule) => handleUpdate(rule, "typeThree")}
                    />
                    <Template
                        header="Type 4"
                        schema={schemaFour()}
                        inputName="Action"
                        submitCallback={(rule) => handleUpdate(rule, "typeFour")}
                    />
                </div>

                <div>
                    <h3>Existing Properties</h3>

                    <h4> Type 1 </h4>

                    <List>
                        {
                            properties.typeOne.map((rule, index) => (
                                <ListItem key={`ListItem-typeOne-${index}`}>
                                    <ListItemText primary={schemaOne(rule[0], rule[1])} />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => handleRemove(index, "typeOne")}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))
                        }
                    </List>

                    <h4> Type 2 </h4>

                    <List>
                        {
                            properties.typeTwo.map((rule, index) => (
                                <ListItem key={`ListItem-typeTwo-${index}`}>
                                    <ListItemText primary={schemaTwo(rule[0], rule[1])} />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => handleRemove(index, "typeTwo")}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))
                        }
                    </List>

                    <h4> Type 3 </h4>

                    <List>
                        {
                            properties.typeThree.map((rule, index) => (
                                <ListItem key={`ListItem-typeThree-${index}`}>
                                    <ListItemText primary={schemaThree(rule[0], rule[1], rule[2])} />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => handleRemove(index, "typeThree")}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))
                        }
                    </List>

                    <h4> Type 4 </h4>

                    <List>
                        {
                            properties.typeFour.map((rule, index) => (
                                <ListItem key={`ListItem-typeFour-${index}`}>
                                    <ListItemText primary={schemaFour(rule[0], rule[1])} />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => handleRemove(index, "typeFour")}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))
                        }
                    </List>
                </div>
            </Container>
    )


    return (
        loading ? <h2> Loading... </h2> : renderContent()
    );
};

export default VerificationProperties;
