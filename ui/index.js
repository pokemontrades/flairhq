import React from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Header from "./layout/header";
import { StoreProvider } from './state';
import styled from 'styled-components';
import Home from './home/Home';
import User from './user/User'

import './style.scss';

const FlairHQContainer = styled.div`
  padding: 30px 30px 0 30px;
  overflow: auto;
  height: calc(100vh - 66px);
`;

let Info = () => <div>Info</div>;
let Tools = () => <div>Tools</div>;

const App = () => (
  <StoreProvider>
    <Router>
      <Header></Header>
      <FlairHQContainer>
          <Switch>
            <Route path="/" exact component={Home} />
            <Route path="/info" component={Info} />
            <Route path="/tools" component={Tools} />
            <Route path="/u/:name">
              <User />
            </Route>
          </Switch>
      </FlairHQContainer>
    </Router>
  </StoreProvider>
)

render(<App />, document.getElementById("root"));
