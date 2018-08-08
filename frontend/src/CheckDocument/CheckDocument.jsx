import React, { Component } from 'react';
import { PageHeader, Panel, ProgressBar, Glyphicon } from 'react-bootstrap';
import ErrorPanel from '../Components/ErrorPanel';
import Navigation from '../Components/Navigation';
import Form from '../Components/FormStateSafe';
import FileJSON from '../Components/FileJSON';
import { InstructionsCheckDocument } from "../Components/Instructions";
import API from '../API';
import config from '../config';
import '../css/styles.css';


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
        if (!this.state.schema.data) {
            return;
        }
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
                    return null;
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

    renderSchemaError() {
        return (
            <ErrorPanel
                title="Schema loading error"
                content={`${this.state.schema.error}`}
            />
        );
    }

    onJSON(obj) {
        if (!obj || !obj.idPart) {
            return;
        }
        this.setState({
            formsData: {
                idPart: obj.idPart,
            }
        });
    }

    renderDocumentForm() {
        const schemaData = this.state.schema.data;
        return (
            <div>
                {schemaData && (
                    <div>
                        <FileJSON
                            onJSON={(obj) => this.onJSON(obj)}
                        />
                        <Form
                            schema={schemaData.idPart.jsonSchema}
                            uiSchema={schemaData.idPart.uiSchema}
                            formData={this.state.formsData.idPart}
                            onSubmit={({formData}) => this.onDocumentIdSubmit(formData)}
                        >
                            <p>
                                <button type="submit" className="btn btn-info">
                                    Check
                                </button>
                            </p>
                        </Form>
                    </div>
                )}
            </div>
        );
    }

    renderDocumentDoesNotExist() {
        return (
            <Panel bsStyle="warning">
                <Panel.Heading>
                    <Panel.Title componentClass="h3">
                        Document
                    </Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    Does not exists
                </Panel.Body>
            </Panel>
        );
    }

    renderConfirmationInfo() {
        const schemaData = this.state.schema.data;
        return (
            <div>
                <Form
                    schema={schemaData.dynamicPart.jsonSchema}
                    uiSchema={{...schemaData.dynamicPart.uiSchema, 'ui:readonly': true}}
                    formData={this.state.check.data.dynamicPart}
                >
                    <button type="submit" style={{display: 'none'}} />
                </Form>
            </div>
        );
    }

    renderNoConfirmation() {
        return 'Document does not confirmed';
    }

    renderConformationInfoTitleText() {
        const schemaData = this.state.check.data;
        return (
            <div>
                Verification passed successfully
                <br />
                <br />
                Document transaction id = {schemaData.dataPartTxId} <Glyphicon glyph="ok" />
                <br />
                Conformation transaction id = {schemaData.dynamicPartTxId} <Glyphicon glyph="ok" />
            </div>
        );
    }

    renderNoConformationTitleText () {
        return (
            <div>
                Document exists but does not confirmed
            </div>
        );
    }

    renderDocument() {
        const schemaData = this.state.schema.data;
        const isConfirmed = !!this.state.check.data.dynamicPart;

        return (
            <Panel bsStyle={isConfirmed ? 'success' : 'warning'}>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">
                        {this.state.check.data.dynamicPart ?
                            this.renderConformationInfoTitleText() :
                            this.renderNoConformationTitleText()
                        }
                    </Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    {isConfirmed && this.renderConfirmationInfo()}
                    <Form
                        schema={schemaData.dataPart.jsonSchema}
                        uiSchema={{...schemaData.dataPart.uiSchema, 'ui:readonly': true}}
                        formData={this.state.check.data.dataPart}
                    >
                        <button type="submit" style={{display: 'none'}} />
                    </Form>
                </Panel.Body>
            </Panel>
        );
    }

    renderCheckStatus() {
        return (
            <div>
                {this.state.check.isLoading && (
                    <ProgressBar active now={100} />
                )}
                {this.state.check.isExists !== null && !this.state.check.isExists && (
                    this.renderDocumentDoesNotExist()
                )}
                {this.state.check.data !== null && (
                    this.renderDocument()
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
                <InstructionsCheckDocument/>
                <PageHeader>
                    Check document
                </PageHeader>
                {this.state.schema.error ?
                    this.renderSchemaError() :
                    this.renderDocumentForm()
                }
                {
                    this.renderCheckStatus()
                }
            </div>
        );
    }
}

export default CheckDocument;
