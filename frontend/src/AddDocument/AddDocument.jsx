import React, { Component } from 'react';
import Form from "react-jsonschema-form";
import { PageHeader, Panel } from 'react-bootstrap';
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
            },
            formsData: {
                idPart: null,
                dataPart: null,
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

    onDocumentAdd(idPart, dataPart) {
        this.setState({
            addDocument: {
                ...this.state.addDocument,
                isLoading: true,
                error: null,
            },
            formsData: {
                idPart,
                dataPart
            }
        });
        API.addDocument(
            config.SCHEMA_ID,
            idPart,
            dataPart
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
        this.onDocumentAdd(this.documentIdPart, this.documentDataPart);
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
                <PageHeader>
                    Add document
                </PageHeader>
                {this.state.schema.error ?
                    <Panel bsStyle="danger">
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Schema loading error</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>{`${this.state.schema.error}`}</Panel.Body>
                    </Panel> :
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
                                onError={(errors) => console.log("Errors1: ",  errors)}
                                ref={ref => this.onDocumentIdFormComponent(ref)}
                            >
                                <button type="submit" style={{display: 'none'}} />
                            </Form>
                            }
                            {this.state.schema.data &&
                            <Form
                                schema={this.state.schema.data.dataPart.jsonSchema}
                                uiSchema={this.state.schema.data.dataPart.uiSchema}
                                formData={this.state.formsData.dataPart}
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
        );
    }
}

export default AddDocument;
