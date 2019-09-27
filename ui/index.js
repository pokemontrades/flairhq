import React from "react";
import { render } from "react-dom";
import { Router, Link } from "@reach/router";
import Header from "./layout/header";
import { StoreProvider } from './state';
import styled from 'styled-components';
import Home from './Home';

import './style.scss';

const FlairHQContainer = styled.div`
  padding: 30px 30px 0 30px;
`;

let Info = () => <div>Info</div>;
let Tools = () => <div>Tools</div>;

const App = () => (
  <StoreProvider>
    <Header></Header>
    <FlairHQContainer>
      <Router>
        <Home path="/" />
        <Info path="info" />
        <Tools path="tools" />
      </Router>
    </FlairHQContainer>
  </StoreProvider>
)

render(<App />, document.getElementById("root"));
