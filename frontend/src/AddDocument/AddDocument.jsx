import React, { Component } from 'react';
import Form from "react-jsonschema-form";
import fields from "react-jsonschema-form-extras";
import API from '../API';
import config from '../config';


class GeoPosition extends Component {
    constructor(props) {
        super(props);
        this.state = { ...props.formData };
    }

    onChange(name) {
        return event => {
            this.setState({ [name]: parseFloat(event.target.value) });
            setImmediate(() => this.props.onChange(this.state));
        };
    }

    render() {
        const { lat, lon } = this.state;
        console.log('ccc', this.props.children);
        return (
            <div className="geo">
                <h3>Hey, I'm a custom component</h3>

{/*
                <SchemaField
                    schema={this.props.schema}
                >
                </SchemaField>
*/}

                <p>
                    I'm registered as <code>geo</code> and referenced in
                    <code>uiSchema</code> as the <code>ui:field</code> to use for this
                    schema.
                </p>
                <div className="row">
                    <div className="col-sm-6">
                        <label>Latitude</label>
                        <input
                            className="form-control"
                            type="number"
                            value={lat}
                            step="0.00001"
                            onChange={this.onChange("lat")}
                        />
                    </div>
                    <div className="col-sm-6">
                        <label>Longitude</label>
                        <input
                            className="form-control"
                            type="number"
                            value={lon}
                            step="0.00001"
                            onChange={this.onChange("lon")}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

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
            }
        };
        this.documentIdFormComponent = null;
        this.documentIdPart = null;
        this.documentDataPart = null;
    }

    componentDidMount() {
        API.getSchema('t'/*config.SCHEMA_ID*/)
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

    onDocumentAdd() {
        this.setState({
            addDocument: {
                ...this.state.addDocument,
                isLoading: true,
                error: null,
            }
        });
        API.addDocument(
            config.SCHEMA_ID,
            this.documentIdPart,
            this.documentDataPart
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
        this.onDocumentAdd();
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
                Add document
                <div>
                    Schema:
                    <div>
                        {this.state.schema.error ?
                            <div>
                                Error:
                                <div>
                                    {JSON.stringify(this.state.schema.error)}
                                </div>
                            </div> :
                            <div>
                                Data:
                                <div>
                                    {JSON.stringify(this.state.schema.data)}
                                    {this.state.schema.data &&
                                        <Form
                                            schema={{...this.state.schema.data.idPart, required: ['id']}}
                                            onSubmit={({formData}) => this.onDocumentIdSubmit(formData)}
                                            onError={(errors) => console.log("Errors1: ",  errors)}
                                            ref={ref => this.onDocumentIdFormComponent(ref)}
                                        >
                                            <button type="submit" style={{display: 'none'}} />
                                        </Form>
                                    }
                                    {this.state.schema.data &&
                                        <Form
                                            schema={this.state.schema.data.dataPart}
                                            uiSchema={{
                                                "operations": {
                                                    /*"ui:field": "table",*/
                                                    items: {
                                                        classNames: 'col-xs-12',
                                                        positionNumber: { classNames: 'col-xs-2' },
                                                        description: { classNames: 'col-xs-2' },
                                                        quantity: { classNames: 'col-xs-2' },
                                                        cost: { classNames: 'col-xs-2' },
                                                        valueWOVAT: { classNames: 'col-xs-2' },
                                                        valueVAT: { classNames: 'col-xs-2' },
                                                    },
                                                },
                                                "listOfStrings": {
                                                    "items": {
                                                        "ui:field": "geo",
                                                        "ui:emptyValue": ""
                                                    }
                                                }
                                            }}
                                            fields={{ ...fields, geo: GeoPosition }}
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
                </div>
            </div>
        );
    }
}

export default AddDocument;
