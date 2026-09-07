// Archivo de inicio del examen

// Issue #3
// Capturamos elementos necesario del DOM
const plan = document.getElementById('plan');
const sucursal = document.getElementById('sucursal');
const adicionalesContainer = document.getElementById('adicionalesContainer');

// Issue #4
const formCotizador = document.getElementById('formCotizador')
const duracion = document.getElementById('duracion');
const precioMensualSpan = document.getElementById('precioMensual');
const precioTotalSpan = document.getElementById('precioTotal');

// Issue #5
const historialLista = document.getElementById('historialLista');
const btnLimpiarHistorial = document.getElementById('btnLimpiarHistorial');

// Recuperamos el historial de localStorage (si está vacío, arranca como un array [] )
let historial = JSON.parse(localStorage.getItem('historial')) || [];

function renderizarHistorial() {
    historialLista.innerHTML = ''; // Limpiamos la lista para que no se duplique
    
    historial.forEach((cotizacion) => {
        historialLista.innerHTML += `
            <li>
                <strong>Plan:</strong> ${cotizacion.planNombre} | 
                <strong>Sucursal:</strong> ${cotizacion.sucursalNombre} | 
                <strong>Duración:</strong> ${cotizacion.meses} meses | 
                <strong>Total:</strong> $${cotizacion.total}
            </li>
        `;
    });
}

// Llamamos a esta función apenas arranca la página para mostrar lo guardado previamente
renderizarHistorial();

// Issue #2
let servicios = [];
let planes = [];
let sucursales = [];
let adicionales = [];

// Consumir la API local usando fetch
async function consumirApi() {
    try {
        const resServicios = await fetch("http://localhost:3000/api/servicios")
        servicios = await resServicios.json()

        const resPlanes = await fetch("http://localhost:3000/api/planes")
        planes = await resPlanes.json()

        const resSucursales = await fetch("http://localhost:3000/api/sucursales")
        sucursales = await resSucursales.json()

        const resAdicionales = await fetch("http://localhost:3000/api/adicionales")
        adicionales = await resAdicionales.json()

        console.log("Datos cargados correctamente: ", {servicios, planes, sucursales, adicionales})
        renderizarOpciones();
        calcularPrecio();
    } catch (error) {
        console.error("Error al consumir API", error);
    }
}
consumirApi();

// Issue #3 damos funcionalidades a los select
function renderizarOpciones(){
    planes.forEach(item => {
        plan.innerHTML += `<option value="${item.id}">${item.nombre}</option>`;
    })
    sucursales.forEach(item => {
        sucursal.innerHTML += `<option value="${item.id}">${item.nombre}</option>`;
    })
    adicionales.forEach(item => {
        adicionalesContainer.innerHTML += `
            <div class="checkbox-item">
                <input type="checkbox" id="adicional_${item.id}" value="${item.precio}">
                <label for="adicional_${item.id}">${item.nombre} (+$${item.precio})</label>
            </div>
        `;
    });
}

// Issue #4 calcular precios y despues actualizar monto por cada cambio
function calcularPrecio() {
    // 1. Obtener precio del plan seleccionado (si no hay nada elegido, es 0)
    // Buscamos el plan en nuestro array usando el ID que está en el select
    const planId = plan.value;
    const planSeleccionado = planes.find(p => p.id === planId);
    let subtotalPlan = planSeleccionado ? planSeleccionado.precio : 0;

    // 2. Sumar los adicionales marcados
    let totalAdicionales = 0;
    // Seleccionamos todos los checkboxes que estén "checked"
    const checkboxesElegidos = document.querySelectorAll('#adicionalesContainer input[type="checkbox"]:checked');
    checkboxesElegidos.forEach(checkbox => {
        totalAdicionales += parseFloat(checkbox.value); // Recuerda que guardamos el precio en el value
    });

    // 3. Aplicar descuentos por duración
    const meses = parseInt(duracion.value);
    let subtotalMensual = subtotalPlan + totalAdicionales;
    let descuento = 0;

    if (meses === 3) descuento = 0.05; // 5%
    if (meses === 6) descuento = 0.10; // 10%
    if (meses === 12) descuento = 0.20; // 20%

    let precioMensualFinal = subtotalMensual - (subtotalMensual * descuento);
    let precioTotalFinal = precioMensualFinal * meses;

    // 4. Dibujar en el HTML
    precioMensualSpan.textContent = precioMensualFinal.toFixed(2);
    precioTotalSpan.textContent = precioTotalFinal.toFixed(2);
}

// CÁLCULO REACTIVO: Cada vez que el usuario toca un select o checkbox, se recalcula
formCotizador.addEventListener('change', () => {
    calcularPrecio();
});
plan.addEventListener('change', calcularPrecio);
duracion.addEventListener('change', calcularPrecio);

// PROCESAR CONTRATACIÓN (El Submit)
formCotizador.addEventListener('submit', (e) => {
    e.preventDefault(); // ¡Frena la recarga de la página!
    // Validación extra de seguridad
    if (plan.value === "" || sucursal.value === "") {
        alert("Por favor elegí un plan y una sucursal.");
        return;
    }
    alert("¡Membresía contratada con éxito!");
    
    // Issue #6
    // Obtenemos los nombres legibles para guardar en el historial (opcional pero queda excelente)
    const planObj = planes.find(p => p.id == plan.value);
    const sucursalObj = sucursales.find(s => s.id == sucursal.value);

    // Creamos el objeto con los datos de esta contratación
    const nuevaCotizacion = {
        planNombre: planObj ? planObj.nombre : "Plan",
        sucursalNombre: sucursalObj ? sucursalObj.nombre : "Sucursal",
        meses: duracion.value,
        total: precioTotalSpan.textContent
    };

    // Lo sumamos al array y lo guardamos convertido a texto con JSON.stringify
    historial.push(nuevaCotizacion);
    localStorage.setItem('historial', JSON.stringify(historial));

    // Issue #4
    // Actualizamos la lista en pantalla
    renderizarHistorial();

    // Limpiar formulario y resetear precios a cero
    formCotizador.reset();
    precioMensualSpan.textContent = "0.00";
    precioTotalSpan.textContent = "0.00";
});

// Issue #6
btnLimpiarHistorial.addEventListener('click', () => {
    // Borramos de la memoria del navegador
    localStorage.removeItem('historial');
    // Vaciamos nuestro array local
    historial = [];
    // Actualizamos la vista
    renderizarHistorial();
});