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
import ReportField from '../Components/ReportField';


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
      resultSchema: {
        data: compActResultSchema,
        error: null,
      },
      resultData: null,
    };
  }

  compareActs() {
    if (this.state.report.data && !this.state.report.error) {

      this.setState({
        resultData: {
          ...this.state.resultData,
          ...CleaningOfStreets.verifyActs(
            this.state.report.data.dataPart,
            this.state.queryData),
        },
      });
    }
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
      queryData: {
        ...queryFormData,
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

  renderConformationInfoTitleText() {
    if (!this.state.report.data)
      return null;
    const reportId = this.state.report.data.dataPartTxId;
    return (
      <p>Отчет: транзакция = {reportId} <Glyphicon glyph="ok" /></p>
    );
  }

  renderResultData() {
    const res = this.state.resultData;

    const renderField = (propName, className) => (
      <ReportField
        key={propName}
        title={this.state.resultSchema.data.jsonSchema.properties[propName].title}
        value={res[propName]}
        className={className}
      />
    );

    return (
      <Panel bsStyle={res.approved === "Успешно"? "success" :"danger"}>
        <Panel.Heading>
          <Panel.Title componentClass="h3">
            <p>Отчет о сверке актов</p>
            <br />
            {this.renderConformationInfoTitleText()}
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <div>
            {renderField('actNumber')}
            {renderField('date')}
            {renderField('contractor')}
            {renderField('period')}
            <br />
            {renderField('jobType')}
            {renderField('location')}
            {renderField('routingSheetNumber')}
            {renderField('carNumber')}
            <br />
            {renderField('approvedDayHours')}
            {renderField('actDayHours')}
            {renderField('diffDayHours', 'field-bold')}
            <br />
            {renderField('approvedNightHours')}
            {renderField('actNightHours')}
            {renderField('diffNightHours', 'field-bold')}
            <br />
            <div className="row field-bold">
              <div className="col-md-6">СТАТУС СВЕРКИ</div>
              <div className="col-md-6">{res.approved}</div>
            </div>

          </div>
        </Panel.Body>
      </Panel>

    )
  }

  renderDocumentForm() {
    if (!this.state.resultData)
      return null;
    return (
      <div>
        {this.renderResultData()}
        {/*<Form*/}
          {/*schema={this.state.resultSchema.data.jsonSchema}*/}
          {/*uiSchema={this.state.resultSchema.data.uiSchema}*/}
          {/*formData={this.state.resultData}*/}
        {/*>*/}
          {/*<div>*/}
            {/*<button type="submit" hidden>Новая сверка</button>*/}
          {/*</div>*/}
        {/*</Form>*/}
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
          Сверка акта
        </PageHeader>
        {this.state.querySchema.error ?
          this.renderSchemaError() :
          this.renderQueryForm()
        }
        {
          <div>
            {(this.state.report.isLoading) && (
              <ProgressBar active now={100} />
            )}
            {(this.state.report.isExists !== null && !this.state.report.isExists) ?
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
