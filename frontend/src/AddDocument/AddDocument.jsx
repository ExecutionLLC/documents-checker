import React, { Component } from 'react';
import Form from "react-jsonschema-form";
import { PageHeader, Panel, ProgressBar } from 'react-bootstrap';
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
            <Panel bsStyle="danger">
                <Panel.Heading>
                    <Panel.Title componentClass="h3">Schema loading error</Panel.Title>
                </Panel.Heading>
                <Panel.Body>{`${this.state.schema.error}`}</Panel.Body>
            </Panel>
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

    rendeerAddDocumentStatus() {
        return (
            <div>
                {this.state.addDocument.isLoading && (
                    <ProgressBar active now={100} />
                )}
                {this.state.addDocument.error && (
                    <Panel bsStyle="danger">
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">Add document error</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>{`${JSON.stringify(this.state.addDocument.error)}`}</Panel.Body>
                    </Panel>
                )}
            </div>
        );
    }

    render() {
        return (
            <div>
                <PageHeader>
                    Add document
                </PageHeader>
                {this.state.schema.error ?
                    this.renderSchemaError() :
                    this.renderDocumentForms()
                }
                {
                    this.rendeerAddDocumentStatus()
                }
            </div>
        );
    }
}

export default AddDocument;
