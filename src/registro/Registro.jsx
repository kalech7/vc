import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import provincias from './provincias.json';
import '../estilos/estilos_registro.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Header from '../inicio/Header';
import Footer from '../inicio/Footer';

const Registro = () => {
  const navigate = useNavigate();

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

  const [errors, setErrors] = useState({});
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [disableProvinceSelect, setDisableProvinceSelect] = useState(true);
  const [step, setStep] = useState(1);

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
      setDisableProvinceSelect(false);
    } else {
      setProvinces([]);
      setDisableProvinceSelect(true);
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
      setFormData({ ...formData, [name]: value, provincia: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setErrors({ ...errors, [name]: '' }); // Clear error message on change
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const sequentialLettersRegex =
      /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/;
    const sequentialNumbersRegex = /012|123|234|345|456|567|678|789/;
    return (
      password.length >= minLength &&
      symbolRegex.test(password) &&
      uppercaseRegex.test(password) &&
      lowercaseRegex.test(password) &&
      !sequentialLettersRegex.test(password.toLowerCase()) &&
      !sequentialNumbersRegex.test(password)
    );
  };

  const validateStep = () => {
    const newErrors = {};
    switch (step) {
      case 1:
        if (!formData.nombre) newErrors.nombre = '*Campo obligatorio';
        if (!formData.apellido) newErrors.apellido = '*Campo obligatorio';
        if (!formData.nodocumento) newErrors.nodocumento = '*Campo obligatorio';
        break;
      case 2:
        if (!formData.pais) newErrors.pais = '*Campo obligatorio';
        if (formData.pais === 'Ecuador' && !formData.provincia)
          newErrors.provincia = '*Campo obligatorio';
        if (!formData.ciudad) newErrors.ciudad = '*Campo obligatorio';
        break;
      case 3:
        if (!formData.correo) newErrors.correo = '*Campo obligatorio';
        if (!formData.celular) newErrors.celular = '*Campo obligatorio';
        break;
      case 4:
        if (!formData.username) newErrors.username = '*Campo obligatorio';
        if (!formData.password) {
          newErrors.password = '*Campo obligatorio';
        } else if (!validatePassword(formData.password)) {
          newErrors.password =
            'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un símbolo y  no debe seguir un patrón consecutivo de letras o números.';
        }
        break;
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateStep()) return;

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

    try {
      const checkResponse = await fetch(
        'https://vc-su7z.onrender.com/check-client',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            email: correo,
            nodocumento,
            celular,
          }),
        }
      );

      if (!checkResponse.ok) {
        const errorData = await checkResponse.json();
        alert(errorData.message);
        return;
      }

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
        username,
        password,
        cuentas: [
          {
            numeroCuenta: numeroCuenta,
            saldo: 0,
            estado: 'activado', // Estado del usuario por defecto
          },
        ],
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
        username,
        password,
        cuentas: [
          {
            numeroCuenta: numeroCuenta,
            saldo: 0,
            estado: 'activado', // Estado del usuario por defecto
          },
        ],
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
          navigate('/login');
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    } else {
      alert('Código de verificación incorrecto.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <div>
              <label htmlFor="nombre">Nombre:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={errors.nombre ? 'error' : ''}
                required
              />
              {errors.nombre && (
                <span className="error-message">{errors.nombre}</span>
              )}
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
                className={errors.apellido ? 'error' : ''}
                required
              />
              {errors.apellido && (
                <span className="error-message">{errors.apellido}</span>
              )}
              <br />
              <br />
            </div>
            <div className="identificacion_user">
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
                className={errors.nodocumento ? 'error' : ''}
                required
              />
              {errors.nodocumento && (
                <span className="error-message">{errors.nodocumento}</span>
              )}
              <br />
              <br />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={handleNextStep}>
                Siguiente
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <div>
              <label htmlFor="pais">País:</label>
              <select
                id="pais"
                name="pais"
                value={formData.pais}
                onChange={handleChange}
                className={errors.pais ? 'error' : ''}
                required
              >
                <option value="">Seleccione un país</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
              {errors.pais && (
                <span className="error-message">{errors.pais}</span>
              )}
            </div>
            <div>
              <label htmlFor="provincia">Provincia:</label>
              <select
                id="provincia"
                name="provincia"
                value={formData.provincia}
                onChange={handleChange}
                className={errors.provincia ? 'error' : ''}
                required
                disabled={disableProvinceSelect}
              >
                <option value="">Seleccione una provincia</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
              {errors.provincia && (
                <span className="error-message">{errors.provincia}</span>
              )}
            </div>
            <div>
              <label htmlFor="ciudad">Ciudad:</label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                className={errors.ciudad ? 'error' : ''}
                required
              />
              {errors.ciudad && (
                <span className="error-message">{errors.ciudad}</span>
              )}
            </div>
            <div id="button-avanza-retro">
              <button type="button" onClick={handlePrevStep}>
                Anterior
              </button>
              <button type="button" onClick={handleNextStep}>
                Siguiente
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <div>
              <label htmlFor="correo">Correo electrónico:</label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className={errors.correo ? 'error' : ''}
                required
              />
              {errors.correo && (
                <span className="error-message">{errors.correo}</span>
              )}
            </div>
            <div>
              <label htmlFor="celular">Celular:</label>
              <input
                type="tel"
                id="celular"
                name="celular"
                value={formData.celular}
                onChange={handleChange}
                className={errors.celular ? 'error' : ''}
                required
              />
              {errors.celular && (
                <span className="error-message">{errors.celular}</span>
              )}
            </div>
            <div id="button-avanza-retro">
              <button type="button" onClick={handlePrevStep}>
                Anterior
              </button>
              <button type="button" onClick={handleNextStep}>
                Siguiente
              </button>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <div>
              <label htmlFor="username">Nombre de Usuario:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : ''}
                required
              />
              {errors.username && (
                <span className="error-message">{errors.username}</span>
              )}
            </div>
            <div>
              <label htmlFor="password">Contraseña:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                required
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>
            <div id="button-avanza-retro">
              <button type="button" onClick={handlePrevStep}>
                Anterior
              </button>
              <button type="submit">Registrar</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Header />
      <div className="principal-container">
        <div className="registro-container">
          <h2>Registro</h2>
          <div className="step-indicators">
            <div className={`step ${step === 1 ? 'active' : ''}`}>
              1. Identificación del Usuario
            </div>
            <div className={`step ${step === 2 ? 'active' : ''}`}>
              2. Información residencial
            </div>
            <div className={`step ${step === 3 ? 'active' : ''}`}>
              3. Información de contacto
            </div>
            <div className={`step ${step === 4 ? 'active' : ''}`}>
              4. Usuario y Contraseña
            </div>
          </div>
          <form className="form-registro" onSubmit={handleSubmit}>
            {renderStep()}
          </form>
        </div>

        {showVerificationPopup && (
          <div className="verification-popup">
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
              <button type="submit">Verificar</button>
            </form>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Registro;
