import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './inicio/Main';
import Login from './login/Login';
import Registro from './registro/Registro';
import Recuperar from './login/Recuperar';
import SobreNosotros from './informacion/SobreNosotros';
import UserDashboard from './dashboard/UserDashboard';
import Historia from './Historia/Historia';
import MovCuenta from './movCuenta/MovCuenta';
import Transferencias from './Transferencias/transferencias';
import Perfil from './perfil/Perfil';
import InterestCalculator from './inversiones/InterestCalculator'; 
import OfertasPage from './ofertas/OfertasPage'; // Importa el nuevo componente
import Ayuda from './ayuda/ayuda'; // Importa el nuevo componente

import Admin from './admin/Admin';

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="app">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/recuperar" element={<Recuperar />} />
            <Route path="/informacion" element={<SobreNosotros />} />
            <Route path="/Historia" element={<Historia />} />
            <Route path="/dashboard" element={<UserDashboard user={user} />} />
            <Route path="/movCuenta" element={<MovCuenta user={user} />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/perfil" element={<Perfil user={user} />} />
            <Route path="/calculadora" element={<InterestCalculator />} /> 
            <Route path="/ofertas" element={<OfertasPage />} /> 
            <Route path="/ayuda" element={<Ayuda />} /> 
            <Route path="/transferencias" element={<Transferencias user={user}/>} />            
            <Route path="/admin" element={<Admin/>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
