import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";

import io from "socket.io-client";
import { BadukView } from "./baduk";

const socket = io(`http://${window.location.hostname}:3000`);

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="about" element={<About />} />
      </Routes>
    </div>
  );
}

function Home() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPong, setLastPong] = useState<string | null>(null);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("pong", () => {
      setLastPong(new Date().toISOString());
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("pong");
    };
  }, []);

  const sendPing = () => {
    socket.emit("ping");
  };

  return (
    <>
      <main>
        <h2>Welcome to Go variants!</h2>
        <div>
          <h3>socket.io tests...</h3>
          <p>Connected: {"" + isConnected}</p>
          <p>{`Last pong: ${lastPong || "-"}`}</p>
          <button onClick={sendPing}>Send ping</button>

          <h3> Here's a go board? </h3>
          <BadukView
            gamestate={{
              board: [[], []],
              next_to_play: 1,
              captures: { 0: 5, 1: 7 },
            }}
            onMove={() => {}}
          ></BadukView>
        </div>
      </main>
      <nav>
        <Link to="/about">About</Link>
      </nav>
    </>
  );
}

function About() {
  return (
    <>
      <main>
        <h2>Who are we?</h2>
        <p>
          <span>Check us out on </span>
          <a href="https://github.com/benjaminpjones/govariants">Github</a>
        </p>
      </main>
      <nav>
        <Link to="/">Home</Link>
      </nav>
    </>
  );
}

export default App;
