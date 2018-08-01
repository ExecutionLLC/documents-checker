import React, { Component } from 'react';
import Form from 'react-jsonschema-form';
import { PageHeader, Panel, ProgressBar } from 'react-bootstrap';
import ErrorPanel from '../Components/ErrorPanel';
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

    renderDocumentPanel(isWarning, content, isMonospace) {
        return (
            <Panel bsStyle={isWarning ? 'warning' : 'info'}>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">
                        Document
                    </Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    {isMonospace ? (
                        <code style={{whiteSpace: 'pre-wrap'}}>
                            {content}
                        </code>
                    ) : (
                        content
                    )}
                </Panel.Body>
            </Panel>

        );
    }

    renderDocumentDoesNotExist() {
        return this.renderDocumentPanel(true, 'Does not exist');
    }

    renderDocument(text) {
        return this.renderDocumentPanel(false, text, true);
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
                    this.renderDocument(JSON.stringify(this.state.check.data, null, 4))
                )}
            </div>
        );
    }

    render() {
        return (
            <div>
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
