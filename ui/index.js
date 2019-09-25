import React from "react";
import { render } from "react-dom";
import { Router, Link } from "@reach/router";
import Header from "./header/header";

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
    <Router>
      <Home path="/" />
      <Info path="info" />
      <Tools path="tools" />
    </Router>
  </div>
)

render(<App />, document.getElementById("root"));
