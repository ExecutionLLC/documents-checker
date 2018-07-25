import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';


class View1 extends Component {
    render() {
        return (
            <div>
                view 1
            </div>
        );
    }
}

class View2 extends Component {
    render() {
        return (
            <div>
                view 2
            </div>
        );
    }
}

class App extends Component {
  render() {
    return (
        <Router>
            <Switch>
                <Route path="/view1" component={View1} />
                <Route path="/view2" component={View2} />
            </Switch>
        </Router>
    );
  }
}

export default App;
