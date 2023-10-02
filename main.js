// API

function buscarDolar(tipo) {
    const apiUrl = "https://criptoya.com/api/dolar";

    return fetch(apiUrl)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if (data.hasOwnProperty(tipo)) {
                const precio = data[tipo];
                return precio; // Devuelve el precio del dólar
            } else {
                throw new Error(`El tipo de dólar "${tipo}" no existe en la respuesta.`);
            }
        });
}

buscarDolar("solidario");

//FUNCIONES

function formatearNumero(numero) {
    return numero.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS'
    });
}

function impuestoPais(precio) {
    let impuestoP=precio*0.30
    return impuestoP
}

function retencionPais(precio) {
    let retencionP=precio*0.45
    return retencionP
}

function obtenerCantidadYPrecio() {
    const cantidad = parseFloat(document.getElementById("CantidadDolares").value);
    const tipoDolar = document.getElementById("TipoDolar").value;
    const precioDolar = buscarDolar(tipoDolar);
    const precioDolarFormateado = formatearNumero(precioDolar);
    const cantidadFormateada = formatearNumero(cantidad);

    return { cantidad, cantidadFormateada, tipoDolar, precioDolar, precioDolarFormateado };
}

function CalcularConImpuestos(cantidad, precioDolar) {
    const totalImpuestos = (cantidad + impuestoPais(cantidad) + retencionPais(cantidad)) * precioDolar;
    return totalImpuestos;
}

function CalcularSinImpuestos(cantidad, precioDolar) {
    const totalSinImpuestos = cantidad * precioDolar;
    return totalSinImpuestos;
}

let precioDolarGlobal; // Variable global para almacenar el precio del dólar

// Compra de dólares
const ComprarDolares = document.getElementById("calcular");

ComprarDolares.addEventListener("click", async (e) => {
    e.preventDefault();
    const impuestos = document.getElementById("AplicarImpuestos");
    const { cantidad, tipoDolar } = obtenerCantidadYPrecio();

    try {
        precioDolarGlobal = await buscarDolar(tipoDolar); // Almacenar el precio del dólar globalmente

        // Verificar si la cantidad es un número válido
        if (isNaN(cantidad) || cantidad <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Ingresá un numero valido',
                text: 'Por favor, ingrese un numero positivo.',
            });
            return;
        }
        if (impuestos.checked) {
            const Total = CalcularConImpuestos(cantidad, precioDolarGlobal); // Pasa precioDolar como argumento
            const impuestoPaisValue = impuestoPais(cantidad * precioDolarGlobal);
            const retencionValue = retencionPais(cantidad * precioDolarGlobal);
            const valorSinImpuestos = Total - impuestoPaisValue - retencionValue;
            const TotalFormateado = formatearNumero(Total);
            const impuestoPaisValueFormateado = formatearNumero(impuestoPaisValue);
            const retencionValueFormateado = formatearNumero(retencionValue);
            const valorSinImpuestosFormateado = formatearNumero(valorSinImpuestos);
            const resultadoSection = document.querySelector(".resultado");
            const resultadoElement = document.createElement("h2");
            resultadoElement.innerHTML = `<div class="p-3 border border-2 border-info border rounded-end">
                                            <div>Precio del Dólar ${tipoDolar}: ${formatearNumero(precioDolarGlobal)}</div>
                                            <div class="my-2 fw-bold">Total sin impuestos: ${valorSinImpuestosFormateado}</div>
                                            <div class="my-2">Impuesto País: ${impuestoPaisValueFormateado}</div>
                                            <div class="my-2 pb-2 border-bottom border-black">Retención: ${retencionValueFormateado}</div>
                                            <div class="my-2 fw-bold">Total: ${TotalFormateado}</div>
                                            </div>`;
            resultadoSection.innerHTML = '';
            resultadoSection.appendChild(resultadoElement);
        } else {
            const Total = CalcularSinImpuestos(cantidad, precioDolarGlobal); // Pasa precioDolar como argumento
            const resultadoSection = document.querySelector(".resultado");
            const resultadoElement = document.createElement("h2");
            const TotalFormateado = formatearNumero(Total);
            resultadoElement.innerHTML = `<div class="p-3 border border-2 border-info border rounded-end">Total sin impuestos: ${TotalFormateado}</div>`;
            resultadoSection.innerHTML = '';
            resultadoSection.appendChild(resultadoElement);
        }
        const resultadoGuardar = document.querySelector(".guardar");
        resultadoGuardar.innerHTML = `<button class="btn btn-success">Guardar este cálculo</button>`;
    } catch (error) {
        console.error("Error al obtener el precio del dólar:", error);
    }
});

// JSON Y LOCALSTORAGE

let Favoritos = [];

function obtenerEstadoCheckbox() {
    return document.getElementById("AplicarImpuestos").checked;
}

const resultadoGuardar = document.querySelector(".guardar");
const resultadosAnteriores = document.querySelector(".resultadosAnteriores");
const listaResultados = document.querySelector(".lista-resultados");
resultadoGuardar.addEventListener("click", (e) => {
    e.preventDefault();
    const { cantidad, tipoDolar } = obtenerCantidadYPrecio();
    const estadoCheckbox = obtenerEstadoCheckbox();
    
    if (isNaN(cantidad) || cantidad <= 0) {
        alert("No se pueden guardar resultados en 0");
    } else {
        // Verificar si la cantidad es un número válido
        if (isNaN(cantidad) || cantidad <= 0) {
            Swal.fire({
                icon: 'error',
                title: 'Ingresá un numero valido',
                text: 'Por favor, ingrese un numero positivo.',
            });
            return;
        }
        const Total = estadoCheckbox ? CalcularConImpuestos(cantidad, precioDolarGlobal) : CalcularSinImpuestos(cantidad, precioDolarGlobal); // Pasa cantidad y precioDolarGlobal como argumentos
        const TotalFormateado = formatearNumero(Total);
        const resultado = {
            cantidad: cantidad,
            tipoDolar: tipoDolar,
            precioDolar: formatearNumero(precioDolarGlobal),
            fecha: new Date().toLocaleString(),
            checkbox: estadoCheckbox,
            total: TotalFormateado
        };
        Favoritos.push(resultado);
        localStorage.setItem("favoritos", JSON.stringify(Favoritos));
        console.log("Se ha guardado el resultado:", resultado);
        
        // Actualizar la lista de resultados
        const listItem = document.createElement("li");
        const tituloResultados = document.querySelector(".resultadosAnteriores");
        tituloResultados.innerHTML = `<h2>Cálculos Anteriores</h2>`
        listItem.innerHTML = `
            <p class="fw-bold"><strong>Cálculo ${Favoritos.length}: Dolar ${resultado.tipoDolar}</strong></p>
            <p>Cantidad: ${resultado.cantidad}</p>
            <p>Precio del Dólar: ${resultado.precioDolar}</p>
            <p>Impuestos aplicados: ${resultado.checkbox ? 'Sí' : 'No'}</p>
            <p class="fw-bold">Total: ${resultado.total}</p>
            <p>Fecha: ${resultado.fecha}</p>
        `;
        listaResultados.appendChild(listItem);
    }
});