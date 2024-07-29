import React from 'react';
import Header from '../inicio/Header'; // Ruta ajustada a la carpeta correcta
import Footer from '../inicio/Footer'; // Ruta ajustada a la carpeta correcta verificada
import  '../estilos/estilos_ayuda.css'; // Asegúrate de crear y definir tus estilos en este archivo

const Ayuda = () => {
  return (
    <div>
      <Header />

      <main className="ayuda-page">
        <section className="container">
          <h1>Ayuda</h1>
          <div className="ayuda-container">
            <div className="ayuda-card">
              <h2>Defensor del cliente de Banco VertexCapital</h2>
              <p>
              Puedes contactar a los Defensores del Cliente, nombrados por la Superintendencia de Bancos, quienes actuarán como mediadores, conciliadores o facilitadores entre los usuarios y la entidad financiera en casos de quejas y reclamos.
              </p>
              
              <p>
                Alejandro Chavez.<br />
                Correo electrónico: <a href="mailto:admin@vertexcapital.today">admin@vertexcapital.today</a><br />
                Teléfono: <a href="tel:+59322345678">(02) 2345678</a>.<br />
                Wilmer Rivas Jaramillo.<br />
                Correo electrónico: <a href="mailto:admin@vertexcapital.today">admin@vertexcapital.today</a><br />
                Teléfono: <a href="tel:+59322584796">(02) 2584796</a>.<br />
                Dirección: Av. Siempre Viva 1234 y Speria, Edificio Central General Piso 4 Oficina 106.<br />
                Elias Bolaños.<br />
                Correo electrónico: <a href="mailto:admin@vertexcapital.today">admin@vertexcapital.today</a><br />
                Teléfono: <a href="tel:+59322345628">(02) 2345678</a>.<br />
                Si tienes consultas sobre tus cuentas, servicios o productos de Banco VertexCapital C.A., comunícate a Banca Telefónica al PBX <a href="tel:+59322588520">(02) 2588520</a>.
              </p>
            </div>

            <div className="ayuda-card">
              <h2>Oficina de la Superintendencia de Bancos</h2>
              <p>
                Av. 12 de Octubre N24-185 y Madrid.<br />
                Quito – Ecuador.<br />
                Teléfono: (593)-299 76 00 / (593)-299 61 00.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Ayuda;