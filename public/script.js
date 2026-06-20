document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;
    const mensajeEl = document.getElementById('mensaje');
    const debugEl = document.getElementById('debug');

    try {
        const respuesta = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo, password })
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            mensajeEl.textContent = 'Acceso concedido. ¡Hackeado!';
            mensajeEl.className = 'mensaje exito';
            debugEl.textContent = `Bienvenido: ${data.usuario.correo} | Rol: ${data.usuario.rol}`;
        } else {
            mensajeEl.textContent = data.error;
            mensajeEl.className = 'mensaje error';
            debugEl.textContent = '';
        }
    } catch (error) {
        mensajeEl.textContent = 'Error de conexión';
        mensajeEl.className = 'mensaje error';
    }
});