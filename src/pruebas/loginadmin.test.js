const request = require('supertest');
const app = require('./app');

describe('POST /loginadmin', () => {

  it('should return user not found', async () => {
    const response = await request(app)
      .post('/loginadmin')
      .send({ username: 'unknown', password: 'password' });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('message', 'Usuario no encontrado.');
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
