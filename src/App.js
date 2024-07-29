import React, { useState, useContext, useEffect } from 'react';
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
import OfertasPage from './ofertas/OfertasPage';
import Ayuda from './ayuda/ayuda';
import AdminDash from './admin/Dashadmin';
import Admin from './admin/Admin';
import Tickets from './tickets/Tickets';
import Equipo from './team/equipo';
import Reclamos from './reclamos/reclamos'; // Importa el componente Reclamos
import { ThemeContext } from './context/ThemeContext'; // Importa el ThemeContext
import ConfirmacionTransferencias from './Transferencias/confirmacion_transferencias';
import './estilos/theme.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const { theme } = useContext(ThemeContext); // Usa el ThemeContext para obtener el tema actual

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

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
            <Route path="/admin" element={<Admin setAdmin={setAdmin}/>} />
            <Route path="/dashadmin" element={<AdminDash admin={admin}/> } />
            <Route path="/tickets" element={<Tickets user={user}/>} />
            <Route path="/equipo" element={<Equipo />}  />
            <Route path="/reclamos" element={<Reclamos />} /> {/* Agrega esta línea */}
            <Route path="/confirmacion-transferencias" component={ConfirmacionTransferencias} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
