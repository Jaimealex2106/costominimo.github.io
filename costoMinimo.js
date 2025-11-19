/**
 * Clase TransporteProblem: Encapsula la lógica del algoritmo de costo mínimo
 * Responsabilidades:
 * - Validar y obtener datos de la tabla
 * - Ejecutar el algoritmo de costo mínimo
 * - Gestionar el balanceo de problemas desbalanceados
 */
class TransporteProblem {
    constructor(numeroFilas, numeroColumnas) {
        // Inicializar propiedades
        this.numeroFilas = numeroFilas;
        this.numeroColumnas = numeroColumnas;
        // Inicializar matrices de costos, oferta y demanda
        this.costos = [];
        this.oferta = [];
        this.demanda = [];
        // Indicadores de orígenes/destinos ficticios
        this.tieneOrigemFicticio = false;
        this.tieneDestFicticio = false;
    }

    //Genera inputs aleatorios para los costos, oferta y demanda
    generardor_numeros_aleatorios(){
        for (let i = 0; i < this.numeroFilas; i++) {
            const filaCostos = [];
            for (let j = 0; j < this.numeroColumnas; j++) {
                const valorCosto = Math.floor(Math.random() * 100) + 1; // Costo entre 1 y 100
                filaCostos.push(valorCosto);
            }
            this.costos.push(filaCostos);

            const valorOferta = Math.floor(Math.random() * 100) + 1; // Oferta entre 1 y 100
            this.oferta.push(valorOferta);
        }

        for (let j = 0; j < this.numeroColumnas; j++) {
            const valorDemanda = Math.floor(Math.random() * 100) + 1; // Demanda entre 1 y 100
            this.demanda.push(valorDemanda);
        }
    }

    /**
     * Obtiene y valida los datos de la tabla del DOM
     * @throws {Error} Si los datos son inválidos
     * @returns {TransporteProblem} this (para encadenamiento de métodos)
     */
    obtenerDatos() {
        this.costos = []; 
        this.oferta = [];
        this.demanda = [];

        // Obtener costos
        for (let i = 0; i < this.numeroFilas; i++) {
            // Arreglo de costos para la fila actual
            const filaCostos = [];
            for (let j = 0; j < this.numeroColumnas; j++) {
                // Obtener el valor del costo desde el input del html correspondiente
                const inputCosto = document.querySelector(`.costo-${i}-${j}`);
                // pasarr a float el valor del input
                const valorCosto = parseFloat(inputCosto.value);

                //Si no hay un número válido, lanzar error
                if (isNaN(valorCosto)) {
                    throw new Error(`Costo inválido en la celda (${i + 1}, ${j + 1}). Por favor ingresa un número válido.`);
                }
                // Agregar el costo a la fila de costos
                filaCostos.push(valorCosto);
            }
            // Agregar la fila de costos a la matriz de costos
            this.costos.push(filaCostos);

            // Obtener oferta atraves del input del html correspondiente para la fila actual
            const inputOferta = document.querySelector(`.oferta-${i}`);
            const valorOferta = parseFloat(inputOferta.value);

            //Si no hay un número válido, lanzar error
            if (isNaN(valorOferta)) {
                throw new Error(`Oferta inválida en la fila ${i + 1}. Por favor ingresa un número válido.`);
            }
            this.oferta.push(valorOferta);
        }

        // Obtener demanda
        for (let j = 0; j < this.numeroColumnas; j++) {
            const inputDemanda = document.querySelector(`.demanda-${j}`);
            const valorDemanda = parseFloat(inputDemanda.value);

            //Si no hay un número válido, lanzar error
            if (isNaN(valorDemanda)) {
                throw new Error(`Demanda inválida en la columna ${j + 1}. Por favor ingresa un número válido.`);
            }
            this.demanda.push(valorDemanda);
        }
        // Balancear el problema si es necesario
        this.balancear();
        // Retornar this para permitir encadenamiento de métodos
        return this;
    }

    /**
     * Balancea el problema si la oferta total no iguala la demanda total
     * Agrega orígenes o destinos ficticios según sea necesario
     */
    balancear() {
        const totalOferta = this.oferta.reduce((a, b) => a + b, 0);
        const totalDemanda = this.demanda.reduce((a, b) => a + b, 0);

        this.tieneOrigemFicticio = false;
        this.tieneDestFicticio = false;

        if (totalOferta !== totalDemanda) {
            if (totalOferta > totalDemanda) {
                // Agregar destino ficticio
                const diferencia = totalOferta - totalDemanda;
                this.demanda.push(diferencia);
                this.costos.forEach(fila => fila.push(0));
                this.tieneDestFicticio = true;
            } else {
                // Agregar origen ficticio
                const diferencia = totalDemanda - totalOferta;
                this.oferta.push(diferencia);
                const nuevaFila = Array(this.demanda.length).fill(0);
                this.costos.push(nuevaFila);
                this.tieneOrigemFicticio = true;
            }
        }
    }

    /**
     * Ejecuta el algoritmo de costo mínimo (método greedy)
     * @returns {Object} Objeto con asignaciones, costoTotal e iteraciones
     */
    resolver() {
        // Copias de oferta y demanda para manipulación
        let ofertaRestante = [...this.oferta];
        let demandaRestante = [...this.demanda];
        // Matriz de solución inicializada en ceros
        const solucion = Array(this.oferta.length).fill(0).map(() => Array(this.demanda.length).fill(0));
        let costoTotal = 0;
        const iteraciones = [];
        let numeroIteracion = 0;

        while (true) {
            // Encontrar la celda con costo mínimo
            let costoMin = Infinity;
            let filaMin = -1;
            let columnaMin = -1;

            for (let i = 0; i < ofertaRestante.length; i++) {
                for (let j = 0; j < demandaRestante.length; j++) {
                    if (ofertaRestante[i] > 0 && demandaRestante[j] > 0 && this.costos[i][j] < costoMin) {
                        costoMin = this.costos[i][j];
                        filaMin = i;
                        columnaMin = j;
                    }
                }
            }

            // Si no hay celdas válidas, terminar
            if (filaMin === -1 || columnaMin === -1) {
                break;
            }

            // Asignar cantidad
            const cantidadAsignada = Math.min(ofertaRestante[filaMin], demandaRestante[columnaMin]);
            solucion[filaMin][columnaMin] = cantidadAsignada;
            costoTotal += cantidadAsignada * this.costos[filaMin][columnaMin];

            // Actualizar oferta y demanda restantes
            ofertaRestante[filaMin] -= cantidadAsignada;
            demandaRestante[columnaMin] -= cantidadAsignada;

            // Guardar iteración
            iteraciones.push({
                iteracion: numeroIteracion + 1,
                filaMin: filaMin,
                columnaMin: columnaMin,
                costo: costoMin,
                cantidad: cantidadAsignada,
                asignaciones: solucion.map(fila => [...fila]),
                costoActual: costoTotal,
                ofertaRestante: [...ofertaRestante],
                demandaRestante: [...demandaRestante]
            });

            numeroIteracion++;
        }

        return {
            asignaciones: solucion,
            costoTotal: costoTotal,
            iteraciones: iteraciones
        };
    }
}

/**
 * Clase UIManager: Gestiona toda la presentación e interacción con el usuario
 * Responsabilidades:
 * - Crear dinámicamente la tabla de entrada
 * - Renderizar los resultados
 * - Manejar eventos del usuario
 */
class UIManager {
    constructor() {
        this.inputFilas = document.getElementById('filas');
        this.inputColumnas = document.getElementById('columnas');
        this.botonGenerarTabla = document.getElementById('generarTabla');
        this.botonLimpiar = document.getElementById('limpiar');
        this.contenedorTabla = document.getElementById('contenedorTabla');
        this.botonCalcular = document.getElementById('calcular');
        this.resultadoDiv = document.getElementById('resultado');
        this.botonNumerosAleatorios = document.getElementById('numeros_aleatorios');
        this.botonFilasColumasAleatorios= document.getElementById('filasyColumnasAleatorios');

    }

    /**
     * Inicializa los eventos de la interfaz
     */
    inicializar() {
        this.botonGenerarTabla.addEventListener('click', () => this.generarTabla());
        this.botonCalcular.addEventListener('click', () => this.calcular());
        this.botonLimpiar.addEventListener('click', () => this.limpiarTodo());
        this.botonNumerosAleatorios.addEventListener('click', () => this.generardor_numeros_aleatorios());
        this.botonFilasColumasAleatorios.addEventListener('click', () => this.generador_filas_columnas_aleatorias());
    }

    /**
     * Limpia toda la interfaz (tabla, resultados, errores)
     */
    limpiarTodo() {
        this.inputFilas.value = '';
        this.inputColumnas.value = '';
        this.contenedorTabla.innerHTML = '';
        this.resultadoDiv.innerHTML = '';
        this.inputFilas.focus();
    }

    generador_filas_columnas_aleatorias(){
        const filasAleatorias = Math.floor(Math.random() * 10) + 1; // Entre 1 y 10
        const columnasAleatorias = Math.floor(Math.random() * 10) + 1; // Entre 1 y 10
        this.inputFilas.value = filasAleatorias;
        this.inputColumnas.value = columnasAleatorias;
        this.generarTabla();

    }
    /**
     * Genera la tabla de entrada basada en filas y columnas
     */
    generarTabla() {
        const numeroFilas = parseInt(this.inputFilas.value);
        const numeroColumnas = parseInt(this.inputColumnas.value);

        // Validar entrada
        if (isNaN(numeroFilas) || isNaN(numeroColumnas) || numeroFilas < 1 || numeroColumnas < 1 || numeroFilas > 10 || numeroColumnas > 10) {
            alert('Por favor ingresa números válidos entre 1 y 10');
            return;
        }

        // Limpiar errores previos
        this.resultadoDiv.innerHTML = '';
        
        this.crearTabla(numeroFilas, numeroColumnas);
    }

    generardor_numeros_aleatorios() {
        const numeroFilas = parseInt(this.inputFilas.value);
        const numeroColumnas = parseInt(this.inputColumnas.value);
        const problema = new TransporteProblem(numeroFilas, numeroColumnas);
        problema.generardor_numeros_aleatorios();

        // Llenar la tabla con los números generados
        for (let i = 0; i < numeroFilas; i++) {
            for (let j = 0; j < numeroColumnas; j++) {
                const inputCosto = document.querySelector(`.costo-${i}-${j}`);
                inputCosto.value = problema.costos[i][j];
            }
            const inputOferta = document.querySelector(`.oferta-${i}`);
            inputOferta.value = problema.oferta[i];
        }
        for (let j = 0; j < numeroColumnas; j++) {
            const inputDemanda = document.querySelector(`.demanda-${j}`);
            inputDemanda.value = problema.demanda[j];
        }
    }


    /**
     * Crea la tabla HTML con inputs para costos, oferta y demanda
     */
    crearTabla(filas, columnas) {
        this.contenedorTabla.innerHTML = '';
        const tabla = document.createElement('table');
        tabla.id = 'tablaDatos';
        tabla.className = 'tabla-datos';

        // Crear encabezado
        const encabezado = tabla.createTHead();
        const filaEncabezado = encabezado.insertRow();

        const celdaVacia = filaEncabezado.insertCell();
        celdaVacia.textContent = 'Origen/Destino';
        celdaVacia.classList.add('table-header');

        for (let j = 0; j < columnas; j++) {
            const celda = filaEncabezado.insertCell();
            celda.textContent = `Destino ${j + 1}`;
            celda.classList.add('table-header');
        }

        const celdaOfertaEncabezado = filaEncabezado.insertCell();
        celdaOfertaEncabezado.textContent = 'Oferta';
        celdaOfertaEncabezado.classList.add('table-header');

        // Crear cuerpo
        const cuerpo = tabla.createTBody();

        for (let i = 0; i < filas; i++) {
            const fila = cuerpo.insertRow();

            const celdaOrigen = fila.insertCell();
            celdaOrigen.textContent = `Origen ${i + 1}`;
            celdaOrigen.classList.add('table-row-header');

            for (let j = 0; j < columnas; j++) {
                const celda = fila.insertCell();
                const input = document.createElement('input');
                input.type = 'number';
                input.className = `costo-${i}-${j}`;
                input.classList.add('input-costo');
                input.placeholder = `Costo(${i + 1},${j + 1})`;
                celda.appendChild(input);
            }

            const celdaOferta = fila.insertCell();
            const inputOferta = document.createElement('input');
            inputOferta.type = 'number';
            inputOferta.className = `oferta-${i}`;
            inputOferta.classList.add('input-oferta');
            inputOferta.placeholder = `Oferta ${i + 1}`;
            celdaOferta.appendChild(inputOferta);
        }

        // Crear fila de demanda
        const filaDemanda = cuerpo.insertRow();
        const celdaDemandaEncabezado = filaDemanda.insertCell();
        celdaDemandaEncabezado.textContent = 'Demanda';
        celdaDemandaEncabezado.classList.add('table-header');

        for (let j = 0; j < columnas; j++) {
            const celda = filaDemanda.insertCell();
            const input = document.createElement('input');
            input.type = 'number';
            input.className = `demanda-${j}`;
            input.classList.add('input-demanda');
            input.placeholder = `Demanda ${j + 1}`;
            celda.appendChild(input);
        }

        const celdaVaciaFinal = filaDemanda.insertCell();

        this.contenedorTabla.appendChild(tabla);
    }

    /**
     * Ejecuta el cálculo del problema de transporte
     */
    calcular() {
        try {
            // Primero validar que la tabla esté completa
            if (!this.validarTablasCompletas()) {
                throw new Error('Por favor completa todos los campos de la tabla antes de calcular.');
            }

            const numeroFilas = parseInt(this.inputFilas.value);
            const numeroColumnas = parseInt(this.inputColumnas.value);

            if (isNaN(numeroFilas) || isNaN(numeroColumnas)) {
                throw new Error('Por favor ingresa el número de filas y columnas');
            }

            // Crear instancia del problema y resolver
            const problema = new TransporteProblem(numeroFilas, numeroColumnas);
            problema.obtenerDatos();
            const resultado = problema.resolver();

            // Mostrar resultado
            this.mostrarResultado(resultado, problema);
        } catch (error) {
            this.mostrarError(error.message);
        }
    }

    /**
     * Muestra un error de forma amigable sin bloquear la interfaz
     */
    mostrarError(mensaje) {
        this.resultadoDiv.innerHTML = '';
        const divError = document.createElement('div');
        divError.className = 'error-message';
        divError.innerHTML = `<strong>❌ Error de validación</strong>
            ${mensaje}<br>
            <button onclick="document.getElementById('contenedorTabla').innerHTML = ''; document.getElementById('resultado').innerHTML = '';">Limpiar tabla</button>`;
        this.resultadoDiv.appendChild(divError);
    }

    /**
     * Valida que todos los inputs de la tabla tengan valores
     */
    validarTablasCompletas() {
        const inputs = this.contenedorTabla.querySelectorAll('input[type="number"]');
        for (let input of inputs) {
            if (input.value.trim() === '') {
                return false;
            }
        }
        return inputs.length > 0;
    }

    /**
     * Muestra el resultado con todas las iteraciones y solución final
     */
    mostrarResultado(resultado, problema) {
        this.resultadoDiv.innerHTML = '';

        const contenedorIteraciones = document.createElement('div');
        contenedorIteraciones.classList.add('resultado-contenedor');

        // Mostrar cada iteración
        resultado.iteraciones.forEach((iter) => {
            const divIteracion = document.createElement('div');
            divIteracion.classList.add('iteracion-box');

            const titulo = document.createElement('h3');
            titulo.textContent = `Iteración ${iter.iteracion}`;
            titulo.classList.add('iteracion-title');
            divIteracion.appendChild(titulo);

            const info = this.crearInfoIteracion(iter, problema);
            divIteracion.appendChild(info);

            const tabla = this.crearTablaAsignaciones(iter.asignaciones, problema, `Asignaciones - Iteración ${iter.iteracion}`);
            divIteracion.appendChild(tabla);

            contenedorIteraciones.appendChild(divIteracion);
        });

        // Mostrar solución final
        const divFinal = document.createElement('div');
        divFinal.classList.add('final-box');

        const tituloFinal = document.createElement('h2');
        tituloFinal.textContent = 'SOLUCIÓN FINAL';
        tituloFinal.classList.add('titulo-final');
        divFinal.appendChild(tituloFinal);

        const costoFinal = document.createElement('p');
        costoFinal.innerHTML = `<strong>Costo total: ${resultado.costoTotal}</strong>`;
        costoFinal.classList.add('costo-final');
        divFinal.appendChild(costoFinal);

        const tablaFinal = this.crearTablaAsignaciones(resultado.asignaciones, problema, 'Solución Final');
        divFinal.appendChild(tablaFinal);

        const detalles = this.crearDetallesFinales(resultado, problema);
        divFinal.appendChild(detalles);

        contenedorIteraciones.appendChild(divFinal);
        this.resultadoDiv.appendChild(contenedorIteraciones);
    }

    /**
     * Crea el párrafo de información de una iteración
     */
    crearInfoIteracion(iter, problema) {
        const info = document.createElement('p');
        const esFicticioOrigen = problema.tieneOrigemFicticio && iter.filaMin === problema.oferta.length - 1;
        const esFicticioDest = problema.tieneDestFicticio && iter.columnaMin === problema.demanda.length - 1;
        const origen = esFicticioOrigen ? 'Origen Ficticio' : `Origen ${iter.filaMin + 1}`;
        const destino = esFicticioDest ? 'Destino Ficticio' : `Destino ${iter.columnaMin + 1}`;

        info.innerHTML = `<strong>${origen} → ${destino}</strong> | Costo unitario: ${iter.costo} | Cantidad asignada: ${iter.cantidad} | Costo parcial: ${iter.cantidad * iter.costo} | Costo acumulado: ${iter.costoActual}`;
        info.classList.add('info-text');
        return info;
    }

    /**
     * Crea la tabla visual de asignaciones
     */
    crearTablaAsignaciones(asignaciones, problema, titulo) {
        const contenedor = document.createElement('div');

        const tituloTabla = document.createElement('p');
        tituloTabla.textContent = titulo;
        tituloTabla.classList.add('table-header', 'titulo-tabla');
        contenedor.appendChild(tituloTabla);

        const tabla = document.createElement('table');
        tabla.className = 'tabla-asignaciones';

        // Encabezado
        const encabezado = tabla.createTHead();
        const filaEncabezado = encabezado.insertRow();

        const celdaVacia = filaEncabezado.insertCell();
        celdaVacia.textContent = 'O/D';
        celdaVacia.classList.add('table-header');

        for (let j = 0; j < problema.demanda.length; j++) {
            const celda = filaEncabezado.insertCell();
            const esFicticio = problema.tieneDestFicticio && j === problema.demanda.length - 1;
            celda.textContent = esFicticio ? 'Fict' : `D${j + 1}`;
            celda.classList.add('table-header');
            if (esFicticio) celda.classList.add('celda-ficticia');
        }

        const celdaOferta = filaEncabezado.insertCell();
        celdaOferta.textContent = 'Oferta';
        celdaOferta.classList.add('table-header');

        // Cuerpo
        const cuerpo = tabla.createTBody();

        for (let i = 0; i < asignaciones.length; i++) {
            const fila = cuerpo.insertRow();

            const celdaOrigen = fila.insertCell();
            const esFicticioOrig = problema.tieneOrigemFicticio && i === problema.oferta.length - 1;
            celdaOrigen.textContent = esFicticioOrig ? 'Ficticio' : `O${i + 1}`;
            celdaOrigen.classList.add('table-row-header');
            if (esFicticioOrig) celdaOrigen.classList.add('celda-ficticia');

            for (let j = 0; j < asignaciones[i].length; j++) {
                const celda = fila.insertCell();
                celda.textContent = asignaciones[i][j] > 0 ? asignaciones[i][j] : '';
                if (asignaciones[i][j] > 0) celda.classList.add('celda-asignacion');
            }

            const celdaOfertaFila = fila.insertCell();
            celdaOfertaFila.textContent = problema.oferta[i];
            celdaOfertaFila.classList.add('table-header');
        }

        // Fila de demanda
        const filaDemanda = cuerpo.insertRow();
        const celdaDemandaEncabezado = filaDemanda.insertCell();
        celdaDemandaEncabezado.textContent = 'Demanda';
        celdaDemandaEncabezado.classList.add('table-header');

        for (let j = 0; j < problema.demanda.length; j++) {
            const celda = filaDemanda.insertCell();
            celda.textContent = problema.demanda[j];
            celda.classList.add('table-header');
        }

        const celdaVaciaFinal = filaDemanda.insertCell();

        contenedor.appendChild(tabla);
        return contenedor;
    }

    /**
     * Crea el detalle final de asignaciones
     */
    crearDetallesFinales(resultado, problema) {
        const detalles = document.createElement('p');
        detalles.classList.add('detalles-text');
        detalles.innerHTML = '<strong>Detalle de asignaciones:</strong><br>';

        resultado.asignaciones.forEach((fila, i) => {
            fila.forEach((cantidad, j) => {
                if (cantidad > 0) {
                    const esFicticioOrigen = problema.tieneOrigemFicticio && i === problema.oferta.length - 1;
                    const esFicticioDest = problema.tieneDestFicticio && j === problema.demanda.length - 1;
                    const origen = esFicticioOrigen ? 'Origen Ficticio' : `Origen ${i + 1}`;
                    const destino = esFicticioDest ? 'Destino Ficticio' : `Destino ${j + 1}`;

                    detalles.innerHTML += `${origen} → ${destino}: ${cantidad} unidades (costo: ${problema.costos[i][j]} c/u, total: ${cantidad * problema.costos[i][j]})<br>`;
                }
            });
        });

        return detalles;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const uiManager = new UIManager();
    uiManager.inicializar();
});
