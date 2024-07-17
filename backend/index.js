const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/login', (req, res) => {
  // Manejar lógica de login
  res.json({ message: 'Login endpoint' });
});

app.post('/recuperar', (req, res) => {
  // Manejar lógica de recuperación
  res.json({ message: 'Recuperar endpoint' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
