document.getElementById('registroForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const documento = document.getElementById('documento').value;
    const nodocumento = document.getElementById('nodocumento').value;
    const pais = document.getElementById('pais').value;
    const provincia = document.getElementById('provincia').value;
    const ciudad = document.getElementById('ciudad').value;
    const correo = document.getElementById('correo').value;
    const celular = document.getElementById('celular').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Generar número de cuenta de 10 dígitos que inicie con 18
    const numeroCuenta = '18' + Math.floor(Math.random() * 9000000000 + 1000000000);

    // Datos para usuarios
    const usuarioData = {
        username: username,
        password: password
    };

    // Datos para clientes
    const clienteData = {
        nombre: nombre,
        apellido: apellido,
        documento: documento,
        nodocumento: nodocumento,
        pais: pais,
        provincia: provincia,
        ciudad: ciudad,
        correo: correo,
        celular: celular,
        numeroCuenta: numeroCuenta
    };

    // Enviar datos a la base de datos
    fetch('http://localhost:3000/save-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuario: usuarioData, cliente: clienteData })
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        // Redirigir a otra página si es necesario
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
