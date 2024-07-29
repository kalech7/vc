import React, { useState } from 'react';
import Header from '../inicio/Header';
import Footer from '../inicio/Footer';
import '../estilos/estilos_interescalculadora.css';

const InterestCalculator = () => {
  const [goal, setGoal] = useState('Casa');
  const [totalAmount, setTotalAmount] = useState(0);
  const [months, setMonths] = useState(0);
  const [monthlySaving, setMonthlySaving] = useState(0);
  const [interestEarned, setInterestEarned] = useState(0);
  const [totalWithInterest, setTotalWithInterest] = useState(0);

  const interestRate = 0.05 / 12; // Tasa de interés mensual

  const calculateSavings = () => {
    const n = months;
    const i = interestRate;
    const FV = totalAmount;

    const PMT = (FV * i) / (Math.pow(1 + i, n) - 1);
    const totalPayments = PMT * n;
    const interestEarned = FV - totalPayments;
    const totalWithInterest = FV + interestEarned;

    setMonthlySaving(PMT.toFixed(2));
    setInterestEarned(interestEarned.toFixed(2));
    setTotalWithInterest(totalWithInterest.toFixed(2));
  };

  return (
    <div>
      <Header />
      <div className="calculator-container">
        <div className="input-section">
          <h3>¿Qué meta quieres cumplir?</h3>
          <select value={goal} onChange={(e) => setGoal(e.target.value)}>
            <option value="Casa">Casa</option>
            <option value="Carro">Coche</option>
            <option value="Viaje">Viaje</option>
          </select>
          <h3>¿Cuál es el monto total que quieres ahorrar?</h3>
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(parseFloat(e.target.value))}
          />
          <h3>¿Cuándo quieres lograr tu meta?</h3>
          <input
            type="number"
            value={months}
            onChange={(e) => setMonths(parseInt(e.target.value))}
          />
          <button className="simular" onClick={calculateSavings}>
            Simular
          </button>

          <div className="result-section">
            <h3>Para cumplir tu meta debes ahorrar:</h3>
            <h2>
              ${monthlySaving} mensualmente durante {months} meses
            </h2>
            <h3>Detalle de tu ahorro</h3>
            <p>Meta a lograr: ${totalAmount.toFixed(2)}</p>
            <p>Plazo: {months} meses</p>
            <p>Ahorro mensual: ${monthlySaving}</p>
            <p>Total interés ganado (5%): ${interestEarned}</p>
            <p>Ahorro + interés: ${totalWithInterest}</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InterestCalculator;
