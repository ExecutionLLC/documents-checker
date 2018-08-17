import React, { Component } from 'react';
import { PageHeader, Panel, ProgressBar, Glyphicon } from 'react-bootstrap';
import ErrorPanel from '../Components/ErrorPanel';
import Navigation from '../Components/Navigation';
import Form from '../Components/FormStateSafe';
import FileJSON from '../Components/FileJSON';
import API from '../API';
import config from '../config';
import '../css/styles.css';
import compDocSchema from './compDoc.json';
import compDocData from './compDocData.json';
import CleaningOfStreets from '../validations/cleaningOfStreets';
import ReportField from "../Components/ReportField";


class CompareDocuments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      schema: {
        data: compDocSchema,
        error: null,
      },
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
      formsData: {
        idPart: null,
      }
    };

    // console.log(`23:30, 03:00 :`, CleaningOfStreets.durationHours('23:30', '03:00'));
    // console.log(`23:30, 23:31 :`, CleaningOfStreets.durationHours('23:30', '23:31'));
    // console.log(`00:00, 00:00 :`, CleaningOfStreets.durationHours('00:00', '00:00'));
    //
    //
    // console.log(' ----------- dayDurationHours ----------- ');
    // console.log(`23:30, 08:30 :`, CleaningOfStreets.dayDurationHours('23:30', '08:30'));
    // console.log(`23:30, 03:00 :`, CleaningOfStreets.dayDurationHours('23:30', '03:00'));
    // console.log(`07:00, 23:00 :`, CleaningOfStreets.dayDurationHours('07:00', '23:00'));
    // console.log(`00:00, 00:00 :`, CleaningOfStreets.dayDurationHours('00:00', '00:00'));
    // console.log(`10:00, 11:30 :`, CleaningOfStreets.dayDurationHours('10:00', '11:30'));
    //
    //
    // console.log(' ----------- nightDurationHours ----------- ');
    // console.log(`23:30, 08:30 :`, CleaningOfStreets.nightDurationHours('23:30', '08:30'));
    // console.log(`23:30, 03:00 :`, CleaningOfStreets.nightDurationHours('23:30', '03:00'));
    // console.log(`07:00, 23:00 :`, CleaningOfStreets.nightDurationHours('07:00', '23:00'));
    // console.log(`00:00, 00:00 :`, CleaningOfStreets.nightDurationHours('00:00', '00:00'));
    // console.log(`23:00, 07:00 :`, CleaningOfStreets.nightDurationHours('23:00', '07:00'));
    // console.log(`10:00, 11:30 :`, CleaningOfStreets.nightDurationHours('10:00', '11:30'));
  }

  compareDocuments() {
    console.log('compareDocuments - begin...');
    if (this.state.report.data && this.state.routingSheet.data &&
      !this.state.report.error && !this.state.routingSheet.error) {

      this.setState({
        formsData: {
          ...this.state.formsData,
          dataPart: CleaningOfStreets.verify(
            this.state.routingSheet.data.dataPart,
            this.state.report.data.dataPart),
        },
      });
    }
    console.log('compareDocuments - end...');
  }

  onDocumentIdSubmit(documentIdPart) {
    if (!this.state.schema.data) {
      return;
    }
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
      formsData: {
        idPart: documentIdPart,
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
        this.compareDocuments();
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
        this.compareDocuments();
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

  renderSchemaError() {
    return (
      <ErrorPanel
        title="Schema loading error"
        content={`${this.state.schema.error}`}
      />
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

  renderDocumentIdForm() {
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
            >
              <p>
                <button type="submit" className="btn btn-info">
                  Check
                </button>
              </p>
            </Form>
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

  renderConformationInfoTitleText() {
    const reportId = this.state.report.data.dataPartTxId;
    const routingSheetId = this.state.routingSheet.data.dataPartTxId;
    return (
      <div>
        <p>Маршрутный лист: транзакция = {routingSheetId} <Glyphicon glyph="ok" /></p>
        <p>Отчет: транзакция = {reportId} <Glyphicon glyph="ok" /></p>
      </div>
    );
  }

  renderResultData() {
    const data = this.state.formsData.dataPart;
    const schema = this.state.schema.data.dataPart.jsonSchema;

    const headerData = data.compareDocHeader;
    const jobsData = data.compareJobsList;

    const headerSchema = schema.properties.compareDocHeader.properties;
    const jobsSchema =  schema.definitions.compareJobsListItem.properties;
    console.log(headerSchema);
    console.log(jobsSchema);


    const renderField = (propName, className) => (
      <ReportField
        key={propName}
        title={headerSchema[propName].title}
        value={headerData[propName]}
        className={className}
      />
    );

    const renderSectionField = (propName, value, className) => (
      <ReportField
        key={propName}
        title={jobsSchema[propName].title}
        value={value}
        className={className}
      />
    );

    const renderSection = (job) => (
      <Panel
        key={`${job.geozone}-${job.materials}`}
        bsStyle={job.approved === "Да" ? "success" : "danger"}
      >
        <Panel.Heading>
          <Panel.Title componentClass="h3">
            {`Геозона: ${job.geozone}`}
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          {renderSectionField('dayOrNight', job['dayOrNight'])}
          {renderSectionField('hoursApproved', job['hoursApproved'])}
          {renderSectionField('hoursByRoutingSheet', job['hoursByRoutingSheet'])}
          {renderSectionField('materials', job['materials'])}
          {renderSectionField('approved', job['approved'], 'field-bold')}
        </Panel.Body>
      </Panel>
    );

    return (
      <Panel bsStyle={headerData.approved === "Да"? "success" : "danger"}>
        <Panel.Heading>
          <Panel.Title componentClass="h3">
            Отчет о сверке маршрутных листов
            <br/>
            <br/>
            {this.renderConformationInfoTitleText()}
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <div>
            {renderField('jobType')}
            {renderField('materials')}
            <br />
            {renderField('approvedDayHours')}
            {renderField('diffDayHours', 'field-bold')}
            <br />
            {renderField('approvedNightHours')}
            {renderField('diffNightHours', 'field-bold')}
            <br />
            {renderField('approved', 'field-bold')}
            <br />
            {jobsData.map((job) => renderSection(job))}
          </div>
        </Panel.Body>
      </Panel>
    )
  }

  renderDocumentForm() {
    if (!this.state.formsData.dataPart)
      return null;
    return (
      <div>
        {this.renderResultData()}
        {/*<Form*/}
          {/*schema={this.state.schema.data.dataPart.jsonSchema}*/}
          {/*uiSchema={this.state.schema.data.dataPart.uiSchema}*/}
          {/*formData={this.state.formsData.dataPart}*/}
        {/*>*/}
          {/*<div>*/}
            {/*<button type="submit" hidden>Submit</button>*/}
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
          Сверка маршрутных листов
        </PageHeader>
        {this.state.schema.error ?
          this.renderSchemaError() :
          this.renderDocumentIdForm()
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

export default CompareDocuments;
