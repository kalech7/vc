import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import '../estilos/estilos_dashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const PayPalButton = ({ amount, onSuccess }) => {
  const validAmount =
    parseFloat(amount) > 0 ? parseFloat(amount).toFixed(2) : null;

  console.log('Monto recibido en PayPalButton:', amount); // Depuración
  console.log('Monto válido en PayPalButton:', validAmount); // Depuración

  if (!validAmount) {
    console.error('Monto inválido:', amount);
    return (
      <p>
        El monto ingresado no es válido. Por favor, ingresa un monto correcto.
      </p>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        'client-id':
          'AQbcgbH8me0hla1WArywcohQbw0KiUubR1OoEwTL9sB6iVJj4g5ukSw9miSmjMs-AukRTHLfbaxWgE11',
      }}
    >
      <PayPalButtons
        style={{ layout: 'horizontal' }}
        createOrder={(data, actions) => {
          console.log('Creando orden con monto:', validAmount); // Depuración
          return actions.order
            .create({
              purchase_units: [
                {
                  amount: {
                    currency_code: 'USD',
                    value: validAmount.toString(), // Forzamos a cadena de texto
                  },
                },
              ],
            })
            .then((orderID) => {
              console.log('Orden creada con ID:', orderID); // Depuración
              return orderID;
            });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then((details) => {
            console.log('Pago aprobado con detalles:', details); // Depuración
            onSuccess(details);
          });
        }}
        onError={(err) => {
          console.error('Error en el pago de PayPal:', err);
        }}
        onCancel={() => {
          console.log('El usuario canceló el pago.');
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
