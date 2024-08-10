import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faFileAlt, faDollarSign, faExchangeAlt, faBalanceScale, faMoneyBillWave, faList } from '@fortawesome/free-solid-svg-icons';

const TransList = ({ transacciones }) => {
    return (
        <div>
            <h2><FontAwesomeIcon icon={faList} /> Lista de Transacciones</h2>
            <table>
                <thead>
                    <tr>
                        <th><FontAwesomeIcon icon={faCalendarAlt} /> Fecha</th>
                        <th><FontAwesomeIcon icon={faFileAlt} /> Descripción</th>
                        <th><FontAwesomeIcon icon={faDollarSign} /> Monto</th>
                        <th><FontAwesomeIcon icon={faExchangeAlt} /> Cuenta Destino</th>
                        <th><FontAwesomeIcon icon={faBalanceScale} /> Saldo Anterior</th>
                        <th><FontAwesomeIcon icon={faMoneyBillWave} /> Saldo Actual</th>
                    </tr>
                </thead>
                <tbody>
                    {transacciones.map((trans, index) => (
                        <tr key={index}>
                            <td>{trans.fecha}</td>
                            <td>{trans.descripcion}</td>
                            <td>{trans.monto}</td>
                            <td>{trans.cuentaDestino}</td>
                            <td>{trans.saldoAnterior}</td>
                            <td>{trans.saldoActual}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransList;
