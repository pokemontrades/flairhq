import React from "react";
import { render } from "react-dom";
import { Router, Link } from "@reach/router";
import Header from "./layout/header";
import { StoreProvider } from './state';
import styled from 'styled-components';
import Home from './Home';
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
    <Header></Header>
    <FlairHQContainer>
      <Router>
        <Home path="/" />
        <User path="/u/:name" />
        <Info path="info" />
        <Tools path="tools" />
      </Router>
    </FlairHQContainer>
  </StoreProvider>
)

render(<App />, document.getElementById("root"));
