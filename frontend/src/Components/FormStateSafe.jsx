import React, {Component} from 'react';
import Form from "react-jsonschema-form";
import '../css/styles.css';


// Default Form fails to reset validation whet onSubmit calls setState
// Can not be stateless due to using its ref
class FormStateSafe extends Component {
    constructor(props) {
        super(props);
        this.formComponent = null;
    }

    onSubmit(evt) {
        if (this.formComponent) {
            this.formComponent.onSubmit(evt);
        }
    }

    render() {
        return (
            <Form
                className="data-form"
                {...this.props}
                onSubmit={(...args) =>
                    setTimeout(
                        () => this.props.onSubmit(...args),
                        0
                    )
                }
                onChange={(...args) =>
                    this.props.onChange &&
                    setTimeout(
                        () => this.props.onChange(...args),
                        0
                    )
                }
                ref={(comp) => {this.formComponent = comp;}}
                liveValidate
                showErrorList={false}
            />
        );
    }
}

export default FormStateSafe;
