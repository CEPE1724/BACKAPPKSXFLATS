const { BroadcastChannel } = require('worker_threads'); // Importar BroadcastChannel desde worker_threads

const channel = new BroadcastChannel('user_created');
console.log('Escuchando nuevos usuarios creados...');
channel.onmessage = (event) => {
    const newUser = event.data;
    console.log('Nuevo usuario creado:', newUser);
    // Aquí puedes manejar el nuevo usuario creado (por ejemplo, enviar notificaciones, actualizar un dashboard, etc.)
};
