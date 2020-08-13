import React from "react";
import s from "./app.module.scss";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./components/home/HomeContainer";
import ErrorFallback from "./components/common/ErrorScreen/ErrorFallback";

class Routes extends React.Component {
  render() {
    return (
      <Router>
        <div className={s.appShell}>
          <div className={s.appContainer}>
            <Switch>
              <Route exact path="/">
                <Home />
              </Route>


              <Route exact path="/errorFallback">
                <ErrorFallback />
              </Route>
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

export default Routes;
