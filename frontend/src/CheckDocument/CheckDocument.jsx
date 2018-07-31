import React, { Component } from 'react';
import Form from 'react-jsonschema-form';
import API from '../API';
import config from '../config';


class CheckDocument extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schema: {
                data: null,
                error: null,
            },
            check: {
                isExists: null,
                data: null,
                isLoading: false,
                error: null,
            },
            formsData: {
                idPart: null,
            }
        };
    }

    componentDidMount() {
        API.getSchema(config.SCHEMA_ID)
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
            this.setState({
                check: {
                    ...this.state.check,
                    isExists: null,
                    data: null,
                    isLoading: true,
                    error: null,
                },
                formsData: {
                    idPart: documentIdPart,
                }
            });
            API.isDocumentExists(config.SCHEMA_ID, documentIdPart)
                .then(isExists => {
                    this.setState({
                        check: {
                            ...this.state.check,
                            isExists,
                            data: null,
                            isLoading: !isExists,
                            error: null,
                        }
                    });
                    return isExists;
                })
                .then((isExist) => {
                    if (!isExist) {
                        return;
                    }
                    return API.getDocument(config.SCHEMA_ID, documentIdPart);
                })
                .then((data) => {
                    this.setState({
                        check: {
                            ...this.state.check,
                            data,
                            isLoading: false,
                            error: null,
                        }
                    });
                })
                .catch((error) => {
                    this.setState({
                        check: {
                            ...this.state.check,
                            isLoading: false,
                            error,
                        }
                    });
                });
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
                                    {`${this.state.schema.error}`}
                                </div>
                            </div> :
                            <div>
                                Data:
                                <div>
                                    {JSON.stringify(this.state.schema.data)}
                                    {this.state.schema.data &&
                                        <Form
                                            schema={this.state.schema.data.idPart.jsonSchema}
                                            uiSchema={this.state.schema.data.idPart.uiSchema}
                                            formData={this.state.formsData.idPart}
                                            onSubmit={({formData}) => this.onDocumentIdSubmit(formData)}
                                            onError={(errors) => console.log("Errors: ",  errors)}
                                        />
                                    }
                                </div>
                                Is exists:
                                {this.state.check.isLoading && <div>Loading...</div>}
                                {this.state.check.isExists !== null && (<div>
                                    {this.state.check.isExists ? 'Exists' : 'Does not exists'}
                                </div>)}
                                {this.state.check.data !== null && (<div>
                                    {JSON.stringify(this.state.check.data)}
                                </div>)}
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default CheckDocument;
