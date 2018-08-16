import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import AddDocument from './AddDocument/AddDocument';
import config from './config';
import CompareDocuments from "./CompareDocuments/CompareDocuments";
import CompareActs from './CompareActs/CompareActs';


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
                    <Route path="/checkdoc" component={CompareDocuments}/>
                    <Route path="/checkact" component={CompareActs}/>
                    <Route exact path="/" render={() => (<Redirect to="/checkdoc" />)} />
                </Switch>
            </Router>
        );
    }
}

export default App;
