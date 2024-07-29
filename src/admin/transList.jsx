import React from 'react';

const TransList = ({ transacciones }) => {
    return (
        <div>
            <h2>Lista de Transacciones</h2>
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Descripción</th>
                        <th>Monto</th>
                        <th>Cuenta Destino</th>
                        <th>Saldo Anterior</th>
                        <th>Saldo Actual</th>
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
