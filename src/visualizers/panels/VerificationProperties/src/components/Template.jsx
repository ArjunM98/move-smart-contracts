import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, TextField, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
    field: {
        marginRight: "2rem"
    },
    inputFormContainer: {
        padding: "1rem"
    }
});

const Template = ({ header, schema, inputName, submitCallback }) => {
    const classes = useStyles();
    const textBlocks = schema.split('[input]');
    const [formData, setFormData] = useState({});
    const [formValidation, setFormValidation] = useState({});

    const isFormDataValid = (data) => {
        var valid = true;
        const validationResult = {};

        for (const [inputIndex, value] of Object.entries(data)) {
            if (value === "") {
                valid = false;
                validationResult[inputIndex] = {
                    error: true,
                    msg: "Field cannot be empty"
                }
            } else {
                validationResult[inputIndex] = {
                    error: false,
                    msg: ""
                }
            }
        }

        setFormValidation(validationResult);

        return valid;
    }

    const handleSubmit = () => {
        const data = { ...formData };

        if (isFormDataValid(data) === true) {
            setFormData({});
            submitCallback(data);
        }
    }

    const ruleText = textBlocks.map((textBlock, index) => {
        let lastItem = false;

        if (index === (textBlocks.length - 1)) {
            lastItem = true;
        }

        return (
            <span key={`${header}-ruleText${index}`}>
                {textBlock}
                {
                    !lastItem && <b>{`${inputName} ${index + 1}`}</b>
                }
            </span>
        )
    })

    const inputForm = textBlocks.map((_, index) => {
        if (index === (textBlocks.length - 1)) {
            return (
                <Button
                    key={`${header}-button${index}`}
                    className={classes.field}
                    variant="contained"
                    color="primary"
                    size="medium"
                    onClick={handleSubmit}
                >
                    Add
                </Button>
            );
        } else {

            // Initialize value
            if (formData[index] === undefined) {
                formData[index] = "";
            }

            return (
                <TextField
                    key={`${header}-input${index}`}
                    className={classes.field}
                    variant="outlined"
                    label={`${inputName} ${index + 1}`}
                    size="small"
                    value={formData[index]}
                    error={formValidation[index] && formValidation[index].error}
                    helperText={formValidation[index] && formValidation[index].msg}
                    onChange={(e) => (setFormData({ ...formData, [index]: e.target.value }))}
                />
            );
        }
    })

    return (
        <div>
            <h4>
                {header}
            </h4>

            <div>
                {ruleText}
            </div>

            <div className={classes.inputFormContainer}>
                {inputForm}
            </div>
        </div>
    );
};

// Expect template string with `[input]` where there should be an input box
Template.propTypes = {
    header: PropTypes.string,
    schema: PropTypes.string,
    inputName: PropTypes.string,
    submitCallback: PropTypes.func
}

export default Template;

