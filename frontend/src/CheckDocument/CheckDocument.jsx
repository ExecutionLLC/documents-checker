import React, { Component } from 'react';
import { PageHeader, Panel, ProgressBar } from 'react-bootstrap';
import ErrorPanel from '../Components/ErrorPanel';
import Navigation from '../Components/Navigation';
import Form from '../Components/FormStateSafe';
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

    renderDocumentForm() {
        const schemaData = this.state.schema.data;
        return (
            <div>
                {schemaData && (
                    <Form
                        schema={schemaData.idPart.jsonSchema}
                        uiSchema={schemaData.idPart.uiSchema}
                        formData={this.state.formsData.idPart}
                        onSubmit={({formData}) => this.onDocumentIdSubmit(formData)}
                    />
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

    renderDocumentConfirmation() {
        const isConfirmed = !!this.state.check.data.dynamicPart;
        return (
            <Panel bsStyle={isConfirmed ? 'success' : 'danger'}>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">
                        Document confirmation
                    </Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    {this.state.check.data.dynamicPart ?
                        this.renderConfirmationInfo() :
                        this.renderNoConfirmation()
                    }
                </Panel.Body>
            </Panel>
        );
    }

    renderDocument() {
        const schemaData = this.state.schema.data;
        return (
            <Panel bsStyle="info">
                <Panel.Heading>
                    <Panel.Title componentClass="h3">
                        Document
                    </Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    {this.renderDocumentConfirmation()}
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
