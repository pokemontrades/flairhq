import React from "react";
import { render } from "react-dom";
import { Router, Link } from "@reach/router";
import Header from "./header/header";
import { Container, Row, Col } from 'reactstrap';
import { StoreProvider } from './state';

import './style.scss';

let Home = () => (
  <div>
    FLAIRHQ 3.0!
  </div>
);
let Info = () => <div>Info</div>;
let Tools = () => <div>Tools</div>;

const App = () => (
  <StoreProvider>
    <Header></Header>
    <Container>
      <Router>
        <Home path="/" />
        <Info path="info" />
        <Tools path="tools" />
      </Router>
    </Container>
  </StoreProvider>
)

render(<App />, document.getElementById("root"));
