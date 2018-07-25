import React, { Component } from 'react';
import Form from "react-jsonschema-form";
import API from '../API';


class AddDocument extends Component {
    constructor(props) {
        super(props);
        this.state = {
            schema: {
                data: null,
                error: null,
            }
        };
        this.documentIdFormComponent = null;
        this.documentIdPart = null;
        this.documentDataPart = null;
    }

    componentDidMount() {
        API.getSchema('test_schema')
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
        API.addDocument(
            'test_schema',
            this.documentIdPart,
            this.documentDataPart
        )
            .then((res) => {
                console.log('res', res);
            })
            .catch((err) => {
                console.log('err', err)
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
                                            onSubmit={({formData}) => this.onDocumentDataSubmit(formData)}
                                        >
                                        </Form>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default AddDocument;
