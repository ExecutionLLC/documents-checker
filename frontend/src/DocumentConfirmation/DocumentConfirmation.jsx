import React, { Component } from 'react';
import httpStatus from 'http-status';
import { PageHeader, Panel, ProgressBar, Glyphicon } from 'react-bootstrap';
import ErrorPanel from '../Components/ErrorPanel';
import Navigation from '../Components/Navigation';
import Form from '../Components/FormStateSafe';
import FileJSON from '../Components/FileJSON';
import { InstructionsConfirmDocument } from "../Components/Instructions";
import API from '../API';
import config from '../config';
import '../css/styles.css';


class DocumentConfirmation extends Component {
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
            confirm: {
                isLoading: false,
                error: null,
                success: false,
                transactionId: null,
            },
            formsData: {
                idPart: null,
                dynamicPart: null,
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
            confirm: {
                isLoading: false,
                error: null,
                success: false,
                transactionId: null,
            },
            formsData: {
                ...this.state.formsData,
                idPart: documentIdPart,
            }
        });
        API.getDocument(config.SCHEMA_ID, documentIdPart)
            .then((data) => {
                this.setState({
                    check: {
                        ...this.state.check,
                        isExists: !!data,
                        data,
                        isLoading: false,
                        error: null,
                    }
                });
            })
            .catch((error) => {
                const isNotFound = error.statusCode === httpStatus.NOT_FOUND;
                this.setState({
                    check: {
                        ...this.state.check,
                        isExists: false,
                        data: null,
                        isLoading: false,
                        error: isNotFound ? null : error,
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

    onConfirmationSubmit(formData) {
        this.setState({
            formsData: {
                ...this.state.formsData,
                dynamicPart: formData,
            },
            confirm: {
                isLoading: true,
                success: false,
                transactionId: null,
                error: null,
            }
        });
        API.updateDynamicPart(
            config.SCHEMA_ID,
            this.state.formsData.idPart,
            formData
        )
            .then((transactionId) => {
                this.setState({
                    confirm: {
                        isLoading: false,
                        success: true,
                        transactionId,
                        error: null,
                    }
                });
            })
            .catch((err) => {
                this.setState({
                    confirm: {
                        isLoading: false,
                        success: false,
                        transactionId: null,
                        error: err,
                    }
                });
            });
    }

    renderConfirmationInput() {
        const schemaData = this.state.schema.data;
        return (
            <div>
                <Form
                    schema={schemaData.dynamicPart.jsonSchema}
                    uiSchema={schemaData.dynamicPart.uiSchema}
                    onSubmit={({formData}) => this.onConfirmationSubmit(formData)}
                    formData={this.state.formsData.dynamicPart}
                />
            </div>
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
                        />
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

    renderConfirmationInfoTitleText() {
        return (
            <div>
                Document confirmed
                <br />
                <br />
                Document transaction id = {this.state.check.data.dataPartTxId} <Glyphicon glyph="ok" />
                <br />
                Conformation transaction id = {this.state.check.data.dynamicPartTxId} <Glyphicon glyph="ok" />
            </div>
        );
    }

    renderConfirmationInputTitleText() {
        return (
            <div>
                Confirm document
            </div>
        );
    }

    renderDocumentConfirmation() {
        const isConfirmed = !!this.state.check.data.dynamicPart;
        return (
            <Panel bsStyle={isConfirmed ? 'success' : 'info'}>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">
                        {isConfirmed ?
                            this.renderConfirmationInfoTitleText() :
                            this.renderConfirmationInputTitleText()
                        }
                    </Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    {isConfirmed ?
                        this.renderConfirmationInfo() :
                        this.renderConfirmationInput()
                    }
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
                {this.state.check.data && (
                    this.renderDocumentConfirmation()
                )}
            </div>
        );
    }

    renderUpdating() {
        const { confirm } = this.state;
        return (
            <div>
                {confirm.isLoading && (
                    <ProgressBar active now={100}/>
                )}
                {confirm.error && (
                    <ErrorPanel
                        title="Confirmation error"
                        content={`${confirm.error}`}
                    />
                )}
                {confirm.transactionId && (
                    <Panel bsStyle="success">
                        <Panel.Heading>
                            <Panel.Title componentClass="h3">
                                Document confirming<br/>
                                transactionId={confirm.transactionId} <Glyphicon glyph="ok" />
                            </Panel.Title>
                        </Panel.Heading>
                        <Panel.Body>
                            Ducument successfully confirmed
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
                <InstructionsConfirmDocument/>
                <PageHeader>
                    Confirm document
                </PageHeader>
                {this.state.schema.error ?
                    this.renderSchemaError() :
                    this.renderDocumentForm()
                }
                {
                    this.renderCheckStatus()
                }
                {
                    this.renderUpdating()
                }
            </div>
        );
    }
}

export default DocumentConfirmation;
