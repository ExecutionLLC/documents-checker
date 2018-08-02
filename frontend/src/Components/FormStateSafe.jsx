import React from 'react';
import Form from "react-jsonschema-form";

// Default Form fails to reset validation whet onSubmit calls setState
function FormStateSafe(props) {
    return (
        <Form
            {...props}
            onSubmit={(...args) =>
                setTimeout(
                    () => props.onSubmit(...args),
                    0
                )
            }
        />
    );
}

export default FormStateSafe;
