import React, { Component } from 'react';
import Form from "react-jsonschema-form";
import API from '../API';


class AddDocument extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schema: {
                data: null,
                error: null,
            }
        };
    }

    componentDidMount() {
        API.getSchema('test_schema')
            .then((data) => {
                this.setState({
                    ...this.state,
                    schema: {
                        data,
                        error: null,
                    }
                });
            })
            .catch((error) => {
                this.setState({
                    ...this.state,
                    schema: {
                        data: null,
                        error,
                    }
                });
            });
    }

    render() {
        return (
            <div>
                Add document
                <div>
                    Schema:
                    <div>
                        {this.state.schema.error ?
                            <div>
                                Error:
                                <div>
                                    {JSON.stringify(this.state.schema.error)}
                                </div>
                            </div> :
                            <div>
                                Data:
                                <div>
                                    {JSON.stringify(this.state.schema.data)}
                                    {this.state.schema.data &&
                                        <Form
                                            schema={{...this.state.schema.data.idPart, required: ['id']}}
                                            onSubmit={({formData}) => console.log("Data submitted: ",  formData)}
                                            onError={(errors) => console.log("Errors: ",  errors)}
                                        />
                                    }
                                    {this.state.schema.data &&
                                        <Form schema={this.state.schema.data.dataPart}
                                        />
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default AddDocument;
