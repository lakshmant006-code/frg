import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClientList } from './screens/ManageClients/ClientList';
import { RegisterProject } from './screens/RegisterProject/RegisterProject';
import './styles/fonts.css';
// Import other components as needed

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ClientList />} />
        <Route path="/clients" element={<ClientList />} />
        <Route path="/register-project" element={<RegisterProject />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default App; 