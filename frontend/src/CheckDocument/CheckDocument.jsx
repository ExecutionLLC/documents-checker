import React, { Component } from 'react';
import Form from 'react-jsonschema-form';
import API from '../API';


class CheckDocument extends Component {
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

    onDocumentIdSubmit(documentIdPart) {
        if (this.state.schema.data) {
            API.isDocumentExists('test_schema', this.state.schema.data.idPart)
                .then(isExists => console.log('isExists', isExists));
        }
    }

    render() {
        return (
            <div>
                Check document
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
                                            onSubmit={({formData}) => this.onDocumentIdSubmit(formData)}
                                            onError={(errors) => console.log("Errors: ",  errors)}
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

export default CheckDocument;
