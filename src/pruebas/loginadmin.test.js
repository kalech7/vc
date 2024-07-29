const request = require('supertest');
const app = require('./app');

describe('POST /loginadmin', () => {
  it('should return a successful login', async () => {
    const response = await request(app)
      .post('/loginadmin')
      .send({ username: 'alech', password: 'alech' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Inicio de sesión exitoso.');
  });

  it('should return user not found', async () => {
    const response = await request(app)
      .post('/loginadmin')
      .send({ username: 'unknown', password: 'password' });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('message', 'Usuario no encontrado.');
  });

  it('should return incorrect password', async () => {
    const response = await request(app)
      .post('/loginadmin')
      .send({ username: 'alech', password: 'waaa' });

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('message', 'Contraseña incorrecta.');
  });

  it('should block account after multiple failed attempts', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/loginadmin')
        .send({ username: 'alech', password: 'aaaa' });
    }

    const response = await request(app)
      .post('/loginadmin')
      .send({ username: 'alech', password: 'aaa' });

    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty(
      'message',
      'Cuenta bloqueada temporalmente. Intente nuevamente más tarde.'
    );
  });
});
