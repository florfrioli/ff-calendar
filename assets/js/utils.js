// Formatea la fecha y hora 
function recortarFechaYHora(datoFechayHora) {
    return fechayHora = {
        anio: datoFechayHora.substring(0, 4),
        mes: datoFechayHora.substring(5, 7),
        dia: datoFechayHora.slice(8, 10),
        hora: datoFechayHora.slice(11, 13),
        minutos: datoFechayHora.slice(14, 16)
    };
};

// Recibe un objeto turno y lo descompone.
function descomponerFecha(turno) {
    const { anio, mes, dia, hora, minutos } = recortarFechaYHora(turno.start);
    let newTurno = {
        anio: anio,
        mes: mes,
        dia: dia,
        hora: hora,
        minutos: minutos,
        estado: turno.estado
    };
    return newTurno;
};

// Vacía el formulario.
function resetFormulario() {
    $(".form-control").val("");
};

// Funcion que recibe una lista de turnos y los ordena del mas nuevo al mas viejo
function ordenarFechasDecreciente(listaTurnos) {
    let auxiliar = [];
    for (let turno of listaTurnos) {
        auxiliar.push(descomponerFecha(turno));
    }
    auxiliar.sort(function(turno1, turno2) {
        if (Number(turno1.anio) < Number(turno2.anio)) {
            return 1;
        }
        if (Number(turno1.anio) > Number(turno2.anio)) {
            return -1;
        }
        return 0;
    });
    auxiliar.sort(function(turno1, turno2) {
        if (Number(turno1.mes) < Number(turno2.mes)) {
            return 1;
        }
        if (Number(turno1.mes) > Number(turno2.mes)) {
            return -1;
        }
        return 0;
    });
    auxiliar.sort(function(turno1, turno2) {
        if (Number(turno1.dia) < Number(turno2.dia)) {
            return 1;
        }
        if (Number(turno1.dia) > Number(turno2.dia)) {
            return -1;
        }
        return 0;
    });
    return auxiliar;
};

// Funcion que recibe la fecha y hora, paciente y especialista y genera el json a mandar a la api
function crearObjetoTurno(datoFechayHora, dnis) {
    const { anio, mes, dia, hora, minutos } = recortarFechaYHora(datoFechayHora);
    let turnoNuevo = {
        anio: anio,
        mes: mes,
        dia: dia,
        hora: hora,
        minutos: minutos,
        especialista: Number(dnis.dniEspecialista),
        paciente: Number(dnis.dniPaciente),
        duracion: 15,
    };
    return turnoNuevo;
};

// Funcion que devuelve la lista de personas ordenada alfabeticamente
function ordenarAlfabeticamente(unaLista) {
    unaLista.sort(function(persona1, persona2) {
        if (persona1.lastname.toLowerCase() > persona2.lastname.toLowerCase()) {
            return 1;
        }
        if (persona1.lastname.toLowerCase() < persona2.lastname.toLowerCase()) {
            return -1;
        }
        return 0;
    });
    return unaLista;
};


// Funcion cerrar sesion, llamada desde el menu lateral
function cerrarSesion() {
    confirmacionOperacion("salir", "")
        .then((resp) => {
            $("#modalSalir").modal('show');
            setTimeout(function() {
                cerrarSesion();
                cerrarSesionFirebase();
                $("#modalSalir").modal('hide');
            }, 3000);
        })
        .catch((error) => {
            console.log(error);
        });
};

// Funcion que confirma operaciones de salir y eliminar con un modal, segun la operación muestra un msj distinto.
const confirmacionOperacion = (accion, dni) => {
    if (accion == "pacientes") {
        // Seguro desea eliminar paciente
        get("PACIENTE", dni)
            .then((paciente) => {
                document.getElementById("pregunta-salida").innerText = "¿Desea eliminar a " + paciente.lastname + ", " + paciente.name + "?";
            })
            .catch((err) => console.log(err));
    }
    if (accion == "turno") {
        // Seguro desea eliminar turno
        document.getElementById("pregunta-salida").innerText = "¿Desea eliminar el turno?";
    }
    if (accion == "especialista") {
        // Seguro desea eliminar especialista
        get("ESPECIALISTA", dni)
            .then((especialista) => {
                document.getElementById("pregunta-salida").innerText = "¿Desea eliminar a " + especialista.lastname + ", " + especialista.name + "?";
            })
            .catch((err) => console.log(err));
    }
    if (accion == "salir") {
        // Seguro desea salir
        document.getElementById("pregunta-salida").innerText = "¿Está seguro que desea salir?";
    }
    $("#modalConfirmacion").modal('show');
    return new Promise(function(resolve, reject) {
        document.getElementById("confirmacion-ok").addEventListener("click", function() {
            resolve();
        });
        document.getElementById("confirmacion-false").addEventListener("click", function() {
            reject();
        });
    })
};

// Funcion llenar select de pacientes y especialistas, recibe una lista, la ordena y los carga:
function llenarSelectConOpciones(lista, tipo) {
    let input = document.getElementById(tipo);
    input.innerHTML = '<option selected disabled value="">Seleccione...</option>';
    let listaOrdenada = ordenarAlfabeticamente(lista);
    for (let persona of listaOrdenada) {
        let opcion = document.createElement("option");
        opcion.setAttribute("value", persona.dni);
        opcion.text = `${persona.lastname.toUpperCase()}, ${persona.name.toUpperCase()}`;
        input.add(opcion, input[input.length]);
    }
    if (tipo == "buscadorEspecialistas") {
        let calendarioActual = document.getElementById("filtro-agenda").value;
        input.value = calendarioActual;
    }
    return true;
};

function tokenVencido() {
    $('#modalSesion').modal('show');
    setTimeout(function() {
        cerrarSesionFirebase();
        /* window.location.href = "./index.html";
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('admin');
        window.localStorage */
        $("#modalSesion").modal('hide');
    }, 3000);
}

var ADMIN = window.localStorage.getItem('admin');