import React, { Component } from 'react';
import Form from "react-jsonschema-form";
import API from '../API';
import config from '../config';


class AddDocument extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schema: {
                data: null,
                error: null,
            },
            addDocument: {
                isLoading: false,
                error: null,
            }
        };
        this.documentIdFormComponent = null;
        this.documentIdPart = null;
        this.documentDataPart = null;
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

    onDocumentIdFormComponent(ref) {
        this.documentIdFormComponent = ref;
    }

    onDocumentAdd() {
        this.setState({
            addDocument: {
                ...this.state.addDocument,
                isLoading: true,
                error: null,
            }
        });
        API.addDocument(
            config.SCHEMA_ID,
            this.documentIdPart,
            this.documentDataPart
        )
            .then(() => {
                this.setState({
                    addDocument: {
                        ...this.state.addDocument,
                        isLoading: false,
                        error: null,
                    },
                });
            })
            .catch((err) => {
                this.setState({
                    addDocument: {
                      ...this.state.addDocument,
                      isLoading: false,
                      error: err,
                    },
                });
            });
    }

    onDocumentIdSubmit(documentIdPart) {
        this.documentIdPart = documentIdPart;
        this.onDocumentAdd();
    }

    onDocumentDataSubmit(documentDataPart) {
        this.documentDataPart = documentDataPart;
        if (this.documentIdFormComponent) {
            this.documentIdFormComponent.onSubmit(
                new CustomEvent('submitFormId')
            );
        }
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
                                            schema={this.state.schema.data.idPart.JSONSchema}
                                            uiSchema={this.state.schema.data.idPart.UISchema}
                                            onSubmit={({formData}) => this.onDocumentIdSubmit(formData)}
                                            onError={(errors) => console.log("Errors1: ",  errors)}
                                            ref={ref => this.onDocumentIdFormComponent(ref)}
                                        >
                                            <button type="submit" style={{display: 'none'}} />
                                        </Form>
                                    }
                                    {this.state.schema.data &&
                                        <Form
                                            schema={this.state.schema.data.dataPart.JSONSchema}
                                            uiSchema={this.state.schema.data.dataPart.UISchema}
                                            onSubmit={({formData}) => this.onDocumentDataSubmit(formData)}
                                        >
                                        </Form>
                                    }
                                </div>
                                {this.state.addDocument.isLoading && <div>Adding document...</div>}
                                {this.state.addDocument.error && <div>Add document error: {JSON.stringify(this.state.addDocument.error)}</div>}
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default AddDocument;
