import React from "react";
import { render } from "react-dom";
import { Router, Link } from "@reach/router";

let Home = () => (
  <div>
    FLAIRHQ 3.0!
  </div>
);
let Info = () => <div>Info</div>;
let Tools = () => <div>Tools</div>;

const App = () => (
  <div>
    <header>
      <h1>Home</h1>
      <nav>
        <Link to="/">Home</Link> |{" "}
        <Link to="info">Info</Link> |{" "}
        <Link to="tools">Tools</Link> |{" "}
        <a href="/api/auth/reddit">Login</a>
      </nav>
    </header>
    <Router>
      <Home path="/" />
      <Info path="info" />
      <Tools path="tools" />
    </Router>
  </div>
)

render(<App />, document.getElementById("root"));
