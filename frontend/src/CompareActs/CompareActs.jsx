import React, { Component } from 'react';
import { PageHeader, Panel, ProgressBar, Glyphicon } from 'react-bootstrap';
import ErrorPanel from '../Components/ErrorPanel';
import Navigation from '../Components/Navigation';
import Form from '../Components/FormStateSafe';
import FileJSON from '../Components/FileJSON';
import API from '../API';
import config from '../config';
import '../css/styles.css';
import compActSchema from './compAct.json';
import compActResultSchema from './compActResult.json';
import CleaningOfStreets from '../validations/cleaningOfStreets';


class CompareActs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      querySchema: {
        data: compActSchema,
        error: null,
      },
      queryData: null,
      report: {
        isExists: null,
        data: null,
        isLoading: false,
        error: null,
      },
      routingSheet: {
        isExists: null,
        data: null,
        isLoading: false,
        error: null,
      },
      resultSchema: {
        data: compActResultSchema,
        error: null,
      },
      resultData: null,
    };
  }

  compareActs() {
    console.log('compareActs - begin...');
    if (this.state.report.data && this.state.routingSheet.data &&
      !this.state.report.error && !this.state.routingSheet.error) {

      this.setState({
        resultData: {
          ...this.state.resultData,
          ...CleaningOfStreets.verifyActs(
            this.state.routingSheet.data.dataPart,
            this.state.report.data.dataPart),
        },
      });
    }
    console.log('compareActs - end...');
  }

  onQuerySubmit(queryFormData) {
    if (!this.state.querySchema.data) {
      return;
    }
    // create documentIdPart from queryFormData
    const documentIdPart = {
      carNumber: queryFormData.carNumber,
      date: queryFormData.date,
      routingSheetNumber: queryFormData.routingSheetNumber,
    };
    this.setState({
      report: {
        ...this.state.report,
        isExists: null,
        data: null,
        isLoading: true,
        error: null,
      },
      routingSheet: {
        ...this.state.routingSheet,
        isExists: null,
        data: null,
        isLoading: true,
        error: null,
      },
      resultData: {
        // fill up most of the properties, excluding calculated ones and approve status
        ...queryFormData,
      }
    });
    API.isDocumentExists(config.SCHEMA_ID, documentIdPart)
      .then(isExists => {
        this.setState({
          report: {
            ...this.state.report,
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
          report: {
            ...this.state.report,
            data,
            isLoading: false,
            error: null,
          }
        });
        console.log('REPORT: ', this.state.report.data);
        this.compareActs();
      })
      .catch((error) => {
        this.setState({
          report: {
            ...this.state.report,
            isLoading: false,
            error,
          }
        });
      });

    API.isDocumentExists(config.SCHEMA_ID_ROUTING_SHEET, documentIdPart)
      .then(isExists => {
        this.setState({
          routingSheet: {
            ...this.state.routingSheet,
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
        return API.getDocument(config.SCHEMA_ID_ROUTING_SHEET, documentIdPart);
      })
      .then((data) => {
        this.setState({
          routingSheet: {
            ...this.state.routingSheet,
            data,
            isLoading: false,
            error: null,
          }
        });
        console.log('ROUTING SHEET: ', this.state.routingSheet.data);
        this.compareActs();
      })
      .catch((error) => {
        this.setState({
          routingSheet: {
            ...this.state.routingSheet,
            isLoading: false,
            error,
          }
        });
      });
  }

  onNewQuery() {
    console.warn('Not implemented');
  }

  renderSchemaError() {
    return (
      <ErrorPanel
        title="Schema loading error"
        content={`${this.state.querySchema.error}`}
      />
    );
  }

  onJSON(obj) {
    if (!obj) {
      return;
    }
    this.setState({
      queryData: obj,
    });
  }

  renderQueryForm() {
    if (!this.state.querySchema.data)
      return null;
    return (
      <div>
        <FileJSON
          onJSON={(obj) => this.onJSON(obj)}
        />
        <Form
          schema={this.state.querySchema.data.jsonSchema}
          uiSchema={this.state.querySchema.data.uiSchema}
          formData={this.state.queryData}
          onSubmit={({formData}) => this.onQuerySubmit(formData)}
        >
          <p>
            <button type="submit" className="btn btn-info">
              Сверить
            </button>
          </p>
        </Form>
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

  renderDocumentForm() {
    if (!this.state.resultData)
      return null;

    console.log('RESULT DATA', this.state.resultData);
    return (
      <Form
        schema={this.state.resultSchema.data.jsonSchema}
        uiSchema={this.state.resultSchema.data.uiSchema}
        formData={this.state.resultData}
        onSubmit={() => this.onNewQuery()}
      >
        <div>
          <button type="submit" hidden>Новая сверка</button>
        </div>
      </Form>
    );
  }

  render() {
    return (
      <div className="container">
        <Navigation
          page={this.props.match.url}
        />
        <PageHeader>
          Сверка акта
        </PageHeader>
        {this.state.querySchema.error ?
          this.renderSchemaError() :
          this.renderQueryForm()
        }
        {
          <div>
            {(this.state.report.isLoading || this.state.routingSheet.isLoading) && (
              <ProgressBar active now={100} />
            )}
            {((this.state.report.isExists !== null && !this.state.report.isExists) ||
              (this.state.routingSheet.isExists !== null && !this.state.routingSheet.isExists)) ?
              this.renderDocumentDoesNotExist() :
              this.renderDocumentForm()
            }
          </div>
        }
      </div>
    );
  }
}

export default CompareActs;
