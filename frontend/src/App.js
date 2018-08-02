import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import AddDocument from './AddDocument/AddDocument';
import CheckDocument from './CheckDocument/CheckDocument';
import DocumentConfirmation from './DocumentConfirmation/DocumentConfirmation';


class App extends Component {
  render() {
    return (
        <Router>
            <Switch>
                <Route path="/adddoc" component={AddDocument} />
                <Route path="/checkdoc" component={CheckDocument} />
                <Route path="/confirmation" component={DocumentConfirmation} />
                <Route component={AddDocument} />
            </Switch>
        </Router>
    );
  }
}

export default App;
