import React, { Component } from 'react';
import Form from 'react-jsonschema-form';
import { PageHeader, Panel, ProgressBar } from 'react-bootstrap';
import ErrorPanel from '../Components/ErrorPanel';
import Navigation from '../Components/Navigation';
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
                        onError={(errors) => console.log("Errors: ",  errors)}
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
        console.log(111, this.state.check);
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
                <Navigation/>
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
