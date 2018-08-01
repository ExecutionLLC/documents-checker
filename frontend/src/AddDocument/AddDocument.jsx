import React, { Component } from 'react';
import Form from "react-jsonschema-form";
import { PageHeader, ProgressBar } from 'react-bootstrap';
import ErrorPanel from '../Components/ErrorPanel';
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

    renderSchemaError() {
        return (
            <ErrorPanel
                title="Schema loading error"
                content={`${this.state.schema.error}`}
            />
        );
    }

    renderIdForm() {
        const schemaData = this.state.schema.data;
        const formsData = this.state.formsData;
        return (
            <Form
                schema={schemaData.idPart.jsonSchema}
                uiSchema={schemaData.idPart.uiSchema}
                formData={formsData.idPart}
                onSubmit={({formData}) => this.onDocumentIdSubmit(formData)}
                ref={ref => this.onDocumentIdFormComponent(ref)}
            >
                <button type="submit" style={{display: 'none'}} />
            </Form>
        );
    }

    renderDataForm() {
        const schemaData = this.state.schema.data;
        const formsData = this.state.formsData;
        return (
            <Form
                schema={schemaData.dataPart.jsonSchema}
                uiSchema={schemaData.dataPart.uiSchema}
                formData={formsData.dataPart}
                onSubmit={({formData}) => this.onDocumentDataSubmit(formData)}
            />
        );
    }

    renderDocumentForms() {
        const schemaData = this.state.schema.data;
        return (
            <div>
                {schemaData && this.renderIdForm()}
                {schemaData && this.renderDataForm()}
            </div>
        );
    }

    renderAddDocumentStatus() {
        return (
            <div>
                {this.state.addDocument.isLoading && (
                    <ProgressBar active now={100} />
                )}
                {this.state.addDocument.error && (
                    <ErrorPanel
                        title="Add document error"
                        content={JSON.stringify(this.state.addDocument.error)}
                    />
                )}
            </div>
        );
    }

    render() {
        return (
            <div className="container">
                <PageHeader>
                    Add document
                </PageHeader>
                {this.state.schema.error ?
                    this.renderSchemaError() :
                    this.renderDocumentForms()
                }
                {
                    this.renderAddDocumentStatus()
                }
            </div>
        );
    }
}

export default AddDocument;
