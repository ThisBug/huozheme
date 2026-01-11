import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Manage from './pages/Manage';
import Settings from './pages/Settings';
import Editor from './pages/Editor';
import AddContact from './pages/AddContact';
import Devices from './pages/Devices';
import Scanning from './pages/Scanning';
import Notifications from './pages/Notifications';
import Logs from './pages/Logs';
import Auth from './pages/Auth';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manage" element={<Manage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/add-contact" element={<AddContact />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/scanning" element={<Scanning />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </Router>
  );
};

export default App;