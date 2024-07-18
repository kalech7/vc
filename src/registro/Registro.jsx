import React, { useState, useEffect } from 'react';
import axios from 'axios';
import provincias from './provincias.json';
import '../estilos/estilos_registro.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Header from '../inicio/Header';
import Footer from '../inicio/Footer';

const Registro = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    documento: 'CI',
    nodocumento: '',
    pais: '',
    provincia: '',
    ciudad: '',
    correo: '',
    celular: '',
    username: '',
    password: '',
  });

  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [disableProvinceSelect, setDisableProvinceSelect] = useState(true); // Estado para deshabilitar selección de provincias

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        const countryList = response.data.map((country) => ({
          name: country.name.common,
          code: country.cca2,
        }));
        setCountries(countryList);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    if (formData.pais === 'Ecuador') {
      const provincesList = fetchProvinces(formData.pais);
      setProvinces(provincesList);
      setDisableProvinceSelect(false); // Habilitar selección de provincias
    } else {
      setProvinces([]); // Limpiar la lista de provincias
      setDisableProvinceSelect(true); // Deshabilitar selección de provincias
    }
  }, [formData.pais]);

  const fetchProvinces = (countryName) => {
    const selectedProvinces = provincias[countryName];
    if (selectedProvinces) {
      return Object.keys(selectedProvinces);
    }
    return [];
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'pais' && value !== 'Ecuador') {
      // Si el país seleccionado no es Ecuador, limpiar provincia seleccionada
      setFormData({ ...formData, [name]: value, provincia: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;

    return password.length >= minLength && symbolRegex.test(password);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const {
      nombre,
      apellido,
      documento,
      nodocumento,
      pais,
      provincia,
      ciudad,
      correo,
      celular,
      username,
      password,
    } = formData;

    if (!validatePassword(password)) {
      alert('La contraseña debe tener al menos 8 caracteres y un símbolo.');
      return;
    }

    try {
      const checkResponse = await fetch('https://vc-su7z.onrender.com/check-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email: correo, nodocumento, celular }),
      });

      if (!checkResponse.ok) {
        const errorData = await checkResponse.json();
        alert(errorData.message);
        return;
      }

      const numeroCuenta =
        '18' + Math.floor(Math.random() * 9000000000 + 1000000000);

      const clienteData = {
        nombre: nombre,
        apellido: apellido,
        documento: documento,
        nodocumento: nodocumento,
        pais: pais,
        provincia: provincia,
        ciudad: ciudad,
        correo: correo,
        celular: celular,
        numeroCuenta: numeroCuenta,
        username: username,
        password: password,
        saldo: 0, // Asegurarse de que saldo sea un número
      };

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);

      const emailResponse = await fetch(
        'https://vc-su7z.onrender.com/send-verification-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: correo, code: code }),
        }
      );

      if (emailResponse.ok) {
        alert(
          'Correo de verificación enviado. Por favor, revisa tu bandeja de entrada.'
        );
        setShowVerificationPopup(true);
      } else {
        alert('Error al enviar el correo de verificación.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleVerificationSubmit = async (event) => {
    event.preventDefault();
    if (verificationCode === generatedCode) {
      alert('Verificación exitosa.');

      const {
        nombre,
        apellido,
        documento,
        nodocumento,
        pais,
        provincia,
        ciudad,
        correo,
        celular,
        username,
        password,
      } = formData;

      const numeroCuenta =
        '18' + Math.floor(Math.random() * 9000000000 + 1000000000);
      const clienteData = {
        nombre,
        apellido,
        documento,
        nodocumento,
        pais,
        provincia,
        ciudad,
        correo,
        celular,
        numeroCuenta,
        username,
        password,
        saldo: 0, // Asegurarse de que saldo sea un número
      };

      await fetch('https://vc-su7z.onrender.com/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cliente: clienteData }),
      })
        .then((response) => response.text())
        .then((data) => {
          alert(data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    } else {
      alert('Código de verificación incorrecto.');
    }
  };

  return (
    <div>
      <Header />
      <div id="registroForm">
        <h1>Registro</h1>
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
          <div>
            <label htmlFor="nombre">Nombre:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
            <br />
            <br />
          </div>
          <div>
            <label htmlFor="apellido">Apellido:</label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
            />
            <br />
            <br />
          </div>
          <div>
            <label htmlFor="documento">Tipo de Documento:</label>
            <select
              id="documento"
              name="documento"
              value={formData.documento}
              onChange={handleChange}
            >
              <option value="CI">CI</option>
              <option value="Pasaporte">Pasaporte</option>
            </select>
            <br />
            <br />
            <label htmlFor="nodocumento">No de documento</label>
            <input
              type="text"
              id="nodocumento"
              name="nodocumento"
              value={formData.nodocumento}
              onChange={handleChange}
            />
            <br />
            <br />
          </div>
          <div>
            <label htmlFor="pais">País:</label>
            <select
              id="pais"
              name="pais"
              value={formData.pais}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un país</option>
              {countries.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="provincia">Provincia:</label>
            <select
              id="provincia"
              name="provincia"
              value={formData.provincia}
              onChange={handleChange}
              required
              disabled={disableProvinceSelect} // Deshabilitar si no es Ecuador
            >
              <option value="">Seleccione una provincia</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ciudad">Ciudad:</label>
            <input
              type="text"
              id="ciudad"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              required
            />
            <br />
            <br />
          </div>
          <div>
            <label htmlFor="correo">Correo Electrónico:</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              required
            />
            <br />
            <br />
          </div>
          <div>
            <label htmlFor="celular">Número de Celular:</label>
            <input
              type="tel"
              id="celular"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              required
            />
            <br />
            <br />
          </div>
          <div>
            <label htmlFor="username">Nombre de usuario:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <br />
            <br />
          </div>
          <div>
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <br />
            <br />
          </div>
          <div className="submit-container">
            <input type="submit" value="Registrarse" id="Registrarse" />
          </div>
        </form>
      </div>
      {showVerificationPopup && (
        <div className="popup">
          <h2>Verificación de Correo</h2>
          <form onSubmit={handleVerificationSubmit}>
            <label htmlFor="verificationCode">Código de Verificación:</label>
            <input
              type="text"
              id="verificationCode"
              name="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
            <br />
            <br />
            <button type="submit">Verificar</button>
          </form>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Registro;
