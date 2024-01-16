let totalCarrito = 0;
const carrito = [];

async function obtenerProductosDesdeJSON() {
    try {
        const response = await fetch('./data/productos.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener productos desde el archivo JSON', error);
        return [];
    }
}

async function cargarProductosEnPagina() {
    const productos = await obtenerProductosDesdeJSON();

    const productosContainer = document.querySelector('.productos');
    productosContainer.innerHTML = '';

    productos.forEach((producto) => {
        const article = document.createElement('article');
        article.className = 'producto';
        article.setAttribute('data-precio', producto.precio);

        const productoInfo = document.createElement('div');
        productoInfo.className = 'producto-info';

        const imagen = document.createElement('img');
        imagen.src = producto.imagen;
        imagen.alt = producto.nombre;

        const titulo = document.createElement('h2');
        titulo.innerText = producto.nombre;

        const precio = document.createElement('p');
        precio.id = 'precio-en-pagina';
        precio.innerText = `Precio: $${producto.precio}`;

        const boton = document.createElement('button');
        boton.innerText = 'Añadir al carrito';
        boton.addEventListener('click', () => addToCart(boton));

        productoInfo.appendChild(imagen);
        productoInfo.appendChild(titulo);
        productoInfo.appendChild(precio);
        productoInfo.appendChild(boton);

        article.appendChild(productoInfo);
        productosContainer.appendChild(article);
    });
}

function addToCart(button) {
    const producto = button.closest('.producto');
    const precio = parseFloat(producto.dataset.precio);
    totalCarrito += precio;

    const nombreProducto = producto.querySelector('h2').innerText;
    carrito.push({ id: Date.now(), nombre: nombreProducto, precio });
    aplicarBonificacion();
    actualizarVisualizacionCarrito();
    guardarCarritoEnLocalStorage();

    showNotification(`"${nombreProducto}" fue añadido al carrito.`, 'green');
}

function eliminarDelCarrito(id) {
    const itemIndex = carrito.findIndex(item => item.id === id);

    if (itemIndex !== -1) {
        const nombreProducto = carrito[itemIndex].nombre;
        const precio = carrito[itemIndex].precio;

        totalCarrito -= precio;
        carrito.splice(itemIndex, 1);

        totalCarrito = Math.max(totalCarrito, 0);

        actualizarVisualizacionCarrito();
        guardarCarritoEnLocalStorage();

        showNotification(`"${nombreProducto}" fue eliminado del carrito.`, 'red');
    }
}

function limpiarCarrito() {
    // limpieza
    carrito.length = 0;
    totalCarrito = 0;

    //  bonificación
    mostrarBonificacionInfo('');

    actualizarVisualizacionCarrito();
    guardarCarritoEnLocalStorage();

    showNotification('El carrito se limpió completamente.', 'red');
}

function guardarCarritoEnLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function mostrarBonificacionInfo(info) {
    const bonificacionInfo = document.getElementById('bonificacion-info');
    bonificacionInfo.innerText = info;
}

function aplicarBonificacion() {
    let bonificacion = 0;

    if (totalCarrito > 85000) {
        bonificacion = totalCarrito * 0.10;
        mostrarBonificacionInfo('¡Bonificación del 10% aplicada!');
    } else if (totalCarrito > 65000) {
        bonificacion = totalCarrito * 0.05;
        mostrarBonificacionInfo('¡Bonificación del 5% aplicada!');
    }
    totalCarrito -= bonificacion;
}

function actualizarVisualizacionCarrito() {
    const listaCarrito = document.getElementById('lista-carrito');
    listaCarrito.innerHTML = '';
    for (let i = 0; i < carrito.length; i++) {
        const item = carrito[i];
        const listItem = document.createElement('li');
        listItem.dataset.id = item.id;
        listItem.innerText = `${item.nombre} - $${item.precio.toFixed(2)}`;
        listaCarrito.appendChild(listItem);
    }

    // total
    const totalCarritoElement = document.getElementById('total-carrito');
    totalCarritoElement.innerText = `Total: $${totalCarrito.toFixed(2)}`;
}

function showNotification(message, color) {
    const notificationContainer = document.getElementById('notification-container');
    notificationContainer.innerText = message;
    notificationContainer.style.backgroundColor = color;
    notificationContainer.classList.add('show-notification');

    setTimeout(() => {
        notificationContainer.classList.remove('show-notification');
    }, 3000); 
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProductosEnPagina();

    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito.push(...JSON.parse(carritoGuardado));
        actualizarVisualizacionCarrito();
    }

    const listaCarrito = document.getElementById('lista-carrito');
    listaCarrito.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const id = event.target.dataset.id;
            eliminarDelCarrito(id);
        }
    });

});
