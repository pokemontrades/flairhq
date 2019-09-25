import React from "react";
import { Link } from "@reach/router";

export default function App () {
  return (
    <div>
      <header>
        <h1>FlairHQ</h1>
        <nav>
          <Link to="/">Home</Link> |{" "}
          <Link to="info">Info</Link> |{" "}
          <Link to="tools">Tools</Link> |{" "}
          <a href="/api/auth/reddit">Login</a>
        </nav>
      </header>
    </div>
  )
};
