import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl, Label } from 'react-bootstrap';


class FileJSON extends Component {
    onFile(file) {
        const reader = new FileReader();
        reader.onload = () => {
            const contents = reader.result;
            let obj = null;
            try {
                obj = JSON.parse(contents);
            } catch(e) {}
            this.props.onJSON(obj);
        };
        reader.readAsText(file);
    }

    render() {
        return (
            <FormGroup>
                <ControlLabel
                    htmlFor="fileUpload"
                    style={{ cursor: "pointer" }}
                >
                    <h3><Label bsStyle="success">Fill by JSON file</Label></h3>
                    <FormControl
                        id="fileUpload"
                        type="file"
                        accept=".json"
                        onChange={(evt) => this.onFile(evt.target.files[0])}
                        style={{ display: "none" }}
                    />
                </ControlLabel>
            </FormGroup>
        );
    }
}

export default FileJSON;
