import React from "react";
import { render } from "react-dom";
import { Router, Link } from "@reach/router";
import Header from "./header/header";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'reactstrap';

let Home = () => (
  <div>
    FLAIRHQ 3.0!
  </div>
);
let Info = () => <div>Info</div>;
let Tools = () => <div>Tools</div>;

const App = () => (
  <div>
    <Header></Header>
    <Container>
      <Router>
        <Home path="/" />
        <Info path="info" />
        <Tools path="tools" />
      </Router>
    </Container>
  </div>
)

render(<App />, document.getElementById("root"));
