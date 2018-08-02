import React, { Component } from 'react';
import Form from 'react-jsonschema-form';
import httpStatus from 'http-status';
import { PageHeader, Panel, ProgressBar } from 'react-bootstrap';
import ErrorPanel from '../Components/ErrorPanel';
import Navigation from '../Components/Navigation';
import API from '../API';
import config from '../config';


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
        console.log('onConfirmationSubmit', formData);
    }

    renderConfirmationInput() {
        const schemaData = this.state.schema.data;
        return (
            <div>
                <Form
                    schema={schemaData.dynamicPart.jsonSchema}
                    uiSchema={schemaData.dynamicPart.uiSchema}
                    onSubmit={({formData}) => this.onConfirmationSubmit(formData)}
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
                    formData={this.state.check.data.dynamicData}
                >
                    <button type="submit" style={{display: 'none'}} />
                </Form>
            </div>
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

    renderDocumentConfirmation() {
        return (
            <Panel bsStyle="info">
                <Panel.Heading>
                    <Panel.Title componentClass="h3">
                        Document confirmation
                    </Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    {this.state.check.data.dynamicData ?
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

    render() {
        return (
            <div className="container">
                <Navigation
                    page={this.props.match.url}
                />
                <PageHeader>
                    Document confirmation
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

export default DocumentConfirmation;
