import React, { Component } from 'react';
import httpStatus from 'http-status';
import { PageHeader, Panel, ProgressBar, Glyphicon } from 'react-bootstrap';
import ErrorPanel from '../Components/ErrorPanel';
import Navigation from '../Components/Navigation';
import Form from '../Components/FormStateSafe';
import FileJSON from '../Components/FileJSON';
import { InstructionsAddDocument } from "../Components/Instructions";
import API from '../API';
import validator from '../validations';
import config from '../config';
import '../css/styles.css';


class AddDocument extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schema: {
                data: null,
                error: null,
            },
            addDocument: {
                validationError: null,
                isLoading: false,
                error: null,
                transactionId: null,
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
        const validationError = validator(this.state.schema.data.validator, idPart, dataPart);

        if (validationError) {
            this.setState({
                addDocument: {
                    ...this.state.addDocument,
                    validationError,
                    isLoading: false,
                    error: null,
                    transactionId: null,
                },
                formsData: {
                    idPart,
                    dataPart
                }
            });
            return;
        }

        this.setState({
            addDocument: {
                ...this.state.addDocument,
                validationError: null,
                isLoading: true,
                error: null,
                transactionId: null,
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
            .then((transactionId) => {
                this.setState({
                    addDocument: {
                        ...this.state.addDocument,
                        isLoading: false,
                        error: null,
                        transactionId,
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

    onDocumentIdChange(documentIdPart) {
        this.setState({
            formsData: {
                idPart: documentIdPart
            }
        });
    }

    onDocumentDataSubmit(documentDataPart) {
        this.documentDataPart = documentDataPart;
        if (this.documentIdFormComponent) {
            this.documentIdFormComponent.onSubmit(
                new CustomEvent('submitFormId')
            );
        }
    }

    onDocumentDataChange(documentDataPart) {
        this.setState({
            formsData: {
                dataPart: documentDataPart
            }
        });
    }

    onFormError() {
        this.setState({
            addDocument: {
                ...this.state.addDocument,
                validationError: 'Form validation error',
                isLoading: false,
                error: null,
                transactionId: null,
            },
        });
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
                onChange={({formData}) => this.onDocumentIdChange(formData)}
                onError={() => this.onFormError()}
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
                onChange={({formData}) => this.onDocumentDataChange(formData)}
                onError={() => this.onFormError()}
            />
        );
    }

    onJSON(obj) {
        if (!obj || !obj.idPart || !obj.dataPart) {
            return;
        }
        this.setState({
            formsData: {
                idPart: obj.idPart,
                dataPart: obj.dataPart,
            }
        });
    }

    renderDocumentForms() {
        const schemaData = this.state.schema.data;
        return (
            <div>
                <FileJSON
                    onJSON={(obj) => this.onJSON(obj)}
                />
                {schemaData && this.renderIdForm()}
                {schemaData && this.renderDataForm()}
            </div>
        );
    }

    renderAddDocumentStatus() {
        return (
            <div>
                {
                    this.state.addDocument.validationError && (
                        <ErrorPanel
                            title="Document validation error"
                            content={this.state.addDocument.validationError}
                        />
                    )
                }
                {this.state.addDocument.isLoading && (
                    <ProgressBar active now={100} />
                )}
                {this.state.addDocument.error && (
                    <ErrorPanel
                        title="Add document error"
                        content={
                            this.state.addDocument.error.statusCode === httpStatus.CONFLICT ?
                                'Document already exists' :
                                JSON.stringify(this.state.addDocument.error)
                        }
                    />
                )}
                {this.state.addDocument.transactionId && (
                    <Panel bsStyle="success">
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">
                                Document adding<br />
                                transactionId={this.state.addDocument.transactionId} <Glyphicon glyph="ok" />
                            </Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            Ducument successfully added
                        </Panel.Body>
                    </Panel>
                )}
            </div>
        );
    }

    render() {
        return (
            <div className="container">
                <Navigation
                    page={this.props.match.url}
                />
                <InstructionsAddDocument />
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
