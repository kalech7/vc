// src/pruebas/Registro.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Registro from '../components/Registro'; // Ajusta la ruta según la ubicación del archivo

// Mocks para fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('Success'),
  })
);

describe('Registro Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('should render form fields correctly', () => {
    render(<Registro />);
    
    // Check if the fields are rendered
    expect(screen.getByLabelText(/Nombre:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Apellido:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de Documento:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/No de documento/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/País:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Provincia:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ciudad:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número de Celular:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre de usuario:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña:/i)).toBeInTheDocument();
  });

  test('should handle form submission', async () => {
    render(<Registro />);
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Nombre:/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Apellido:/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Tipo de Documento:/i), { target: { value: 'cedula' } });
    fireEvent.change(screen.getByLabelText(/No de Documento:/i), { target: { value: '1750172494' } });
    fireEvent.change(screen.getByLabelText(/País:/i), { target: { value: 'Ecuador' } });
    fireEvent.change(screen.getByLabelText(/País:/i), { target: { value: 'quito' } });
    fireEvent.change(screen.getByLabelText(/Correo Electrónico:/i), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText(/Número de Celular:/i), { target: { value: '09992566231' } });
    fireEvent.change(screen.getByLabelText(/Número de usuario:/i), { target: { value: 'usual' } });
    fireEvent.change(screen.getByLabelText(/Contraseña:/i), { target: { value: 'Password123!' } });

    // Mock successful response for check-client
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    // Submit the form
    fireEvent.click(screen.getByText(/Registrarse/i));

    // Wait for verification email response
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3030/check-client', expect.any(Object));
      expect(fetch).toHaveBeenCalledWith('http://localhost:3030/send-verification-email', expect.any(Object));
    });
  });

  test('should handle verification popup', async () => {
    render(<Registro />);
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    fireEvent.click(screen.getByText(/Registrarse/i));

    // Wait for popup to show
    await waitFor(() => {
      expect(screen.getByLabelText(/Código de Verificación:/i)).toBeInTheDocument();
    });

    // Simulate verification code submission
    fireEvent.change(screen.getByLabelText(/Código de Verificación:/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verificar/i));

    // Mock successful response for save-data
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('Success'),
      })
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:3030/save-data', expect.any(Object));
    });
  });
});
