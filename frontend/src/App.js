import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import AddDocument from './AddDocument/AddDocument';
import CheckDocument from './CheckDocument/CheckDocument';
import DocumentConfirmation from './DocumentConfirmation/DocumentConfirmation';
import config from './config';


class App extends Component {
    componentDidMount() {
        document.title = "Система сверки документов";
    }

    render() {
        return (
            <Router>
                <Switch>
                    <Route
                      path="/routing_sheet"
                      render={
                        (props) => (
                          <AddDocument
                            title="Маршрутный лист"
                            schemaId={config.SCHEMA_ID_ROUTING_SHEET}
                            {...props}
                          />
                        )
                      }
                    />
                    <Route
                      path="/report"
                      render={
                        (props) => (
                          <AddDocument
                            title="Отчет"
                            schemaId={config.SCHEMA_ID}
                            {...props}
                          />
                        )
                      }
                    />
                    <Route path="/confirmation" component={DocumentConfirmation}/>
                    <Route component={AddDocument}/>
                </Switch>
            </Router>
        );
    }
}

export default App;
