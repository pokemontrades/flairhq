import React, { useState, useEffect } from "react";
import { Link } from "@reach/router";

export default function App () {
  const [user, setUser] = useState({});

  useEffect(() => {
    if (!user || !user.name) {
      async function fetchData() {
        const userData = await fetch('/api/me').then((res) => res.json());
        setUser(userData);
      }
      fetchData();
    }
  });

  return (
    <div>
      <header>
        <h1>FlairHQ</h1>
        <nav>
          <Link to="/">Home</Link> |{" "}
          <Link to="info">Info</Link> |{" "}
          <Link to="tools">Tools</Link> |{" "}
          {user && user.isMod && "You are a mod | "}
          {user && user.name ? <a href="/logout">Logout</a> : <a href="/api/auth/reddit">Login</a>}
        </nav>
      </header>
    </div>
  )
};
