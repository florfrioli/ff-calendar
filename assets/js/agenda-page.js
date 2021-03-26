window.onload = iniciarAgenda;

// Función que carga la página principal y define los eventos:
function iniciarAgenda() {
    if (window.localStorage.getItem('login') == "true") {
        cargarFiltroEspecialistas(ADMIN);

        //Barra lateral
        $('#sidebarCollapse').on('click', function() {
            $('#sidebar').toggleClass('active');
        });

        // Oculto las alertas
        $("#alerta").hide();

        // Botón eliminar turno
        $("#cancelar-turno").on("click", eliminarTurnoDeLaAgenda);

        // Boton confirmar estado del turno
        $("#guardar-turno").on("click", cambiarEstadoTurno);

        //Boton agregar nuevo paciente
        $(".agregarNuevoPaciente").on('click', agregarPaciente);

        //Boton agregar nuevo Especialista
        $(".agregarNuevoEspecialista").on('click', agregarEspecialista);

        //Boton ayuda con referencia colores
        $("#ayuda-colores").on('click', function() {
            $("#modalAyudaColores").modal('show');
        });

        // Boton salir
        $("#btn-sign-out").on('click', cerrarSesion);
    } else window.location.href = "./index.html";
};

// Función que devuelve una promesa con el estado del turno
const obtenerEstadoNuevo = () => {
    return new Promise(function(resolve, reject) {
        // Obtiene el estado seleccionado de la lista desplegable
        let nuevoEstado = document.getElementById("estado").value;
        if (nuevoEstado != "") {
            resolve(nuevoEstado);
        } else {
            reject("ERROR: El estado nuevo está vacío");
        }
    });
};

// Funcion que cambia el estado de un turno seleccionado. Obtiene su estado y hace un put a la base de datos.
function cambiarEstadoTurno() {
    let opcionEspecialista = document.getElementById("filtro-agenda").value;
    obtenerEstadoNuevo()
        .then((respuesta) => {
            obtenerTurnoActivo()
                .then((turno) => {
                    putTurnoNuevoEstado(turno._id, respuesta)
                        .then((resp) => {
                            (new Alerta("El turno fue actualizado!", "Actualizar turno")).mostrar();
                            cargarCalendario(opcionEspecialista);
                        })
                        .catch((err) => {
                            console.log(err);
                            (new Alerta("ERROR - El turno no pudo actualizarse: " + err, "Actualizar turno")).mostrar();
                            cargarCalendario(opcionEspecialista);
                        });
                });
        })
        .catch((error) => {
            console.log("Error: " + error);
            cargarCalendario(opcionEspecialista);
            (new Alerta(error + ", intente nuevamente.", "Actualizar Turno")).mostrar();
        })
};

// Recolecta el paciente y el especialista seleccionado para el nuevo turno y devuelve sus dnis
function recolectarDNIsDelForm() {
    let dniElegido = document.getElementById("buscadorPacientes").value;
    let dniElegidoEsp = document.getElementById("buscadorEspecialistas").value;
    return { dniPaciente: dniElegido, dniEspecialista: dniElegidoEsp };
};

// Funcion que recolecta los datos del formulario del nuevo turno y devuelve una promesa
const recolectarPacienteyEspecialista = () => {
    return new Promise(function(resolve, reject) {
        let form = document.getElementById('form-nuevo-turno');
        form.addEventListener('submit', function(ev) {
            'use strict'
            ev.preventDefault();
            ev.stopPropagation();
            let checked = form.checkValidity();
            if (checked) {
                form.classList.add('was-validated');
                const { dniPaciente, dniEspecialista } = recolectarDNIsDelForm();
                $("#modalSeleccionPaciente").modal('hide'); // oculto el form 
                form.classList.remove('was-validated');
                resolve({ dniPaciente, dniEspecialista });
            } else {

            }
        }, false);
    });
};

// Funcion que recibe los datos de fecha y hora, y habilita la lista de personas para crear un turno nuevo.
function agregarEvento(datoFechayHora) {
    $("#modalSeleccionPaciente").modal('show');
    const { anio, mes, dia, hora, minutos } = recortarFechaYHora(datoFechayHora);
    cargarPacientesExistentes()
        .then(() => {
            cargarEspecialistasExistentes(ADMIN)
                .then(() => {
                    document.getElementsByClassName("modal-title")[0].innerText = "Nuevo turno: " + dia + "-" + mes + "-" + anio + " a las " + hora + ":" + minutos;
                    recolectarPacienteyEspecialista()
                        .then((respuesta) => {
                            let turnoNuevo = crearObjetoTurno(datoFechayHora, respuesta);
                            postTurno(turnoNuevo)
                                .then((resp) => {
                                    let calendarioActual = document.getElementById("filtro-agenda").value;
                                    cargarCalendario(calendarioActual);
                                    (new Alerta("El turno fue creado con éxito!", "Nuevo Turno")).mostrar();
                                })
                                .catch((err) => {
                                    (new Alerta("Error: " + err, "Nuevo turno")).mostrar();
                                    document.getElementById("form-nuevo-turno").reset();
                                });
                        });
                }).catch((error) => {
                    (new Alerta("Error: " + error, "Base de Datos")).mostrar();
                    console.log(error);
                });
        }).catch((error) => {
            console.log(error);
            (new Alerta(error + "Error: " + error, "Base de Datos")).mostrar();
            cargarCalendario(calendarioActual);
        });
};

//  Funcion que carga los datos en el modal de la info del paciente
function mostrarDatosDelTurno(info) {
    $("#modalEstadoTurno").modal('show');
    let fecha = info.event.startStr.substring(0, info.event.startStr.length - 6);
    document.getElementById("dato-fecha-turno").innerText = "Turno: " + fecha;
    get("PACIENTE", info.event.extendedProps.paciente)
        .then((paciente) => {
            cargarInfoTurnoEnModal(paciente, info.event);
        })
        .catch((err) => console.log(err));
};

// Funcion que elimina un turno al pulsar el boton eliminar del modal. Trabaja con promesa que obtiene los datos.
function eliminarTurnoDeLaAgenda() {
    let calendarioActual = document.getElementById("filtro-agenda").value;
    confirmacionOperacion("turno", dni)
        .then((respuesta) => {
            obtenerTurnoActivo()
                .then((turno) => {
                    deleteTurno(turno._id)
                        .then((resp) => {
                            (new Alerta("Fue eliminado con éxito!", "Eliminar Turno")).mostrar();
                            cargarCalendario(calendarioActual);
                        })
                        .catch((err) => {
                            (new Alerta("No se pudo eliminar: " + err, "Eliminar Turno")).mostrar();
                            cargarCalendario(calendarioActual);
                        });
                })
        })
        .catch((err) => console.log(err)); // Se cancelo la operacion borrar
};

// Funcion que carga los datos en el modal
function cargarInfoTurnoEnModal(unPaciente, evento) {
    document.getElementById("nombre-turno").value = evento.title.toUpperCase();
    document.getElementById("dni-turno").value = unPaciente.dni;
    document.getElementById("obraSocial-turno").value = unPaciente.obraSocial.toUpperCase();
    document.getElementById("estado").value = evento.extendedProps.estado.toUpperCase();
};

// Funcion que devuelve el id del turno mostrado en el modal
function obtenerTurnoActivo() {
    return new Promise(function(resolve, reject) {
        let fecha = document.getElementById("dato-fecha-turno").innerText.split("Turno: ", 2)[1];;
        let dniPaciente = document.getElementById("dni-turno").value;
        get("PACIENTE", dniPaciente)
            .then((paciente) => {
                getTurnosDe("PACIENTE", paciente._id)
                    .then((turnos) => {
                        for (let turno of turnos) {
                            if (turno.start == fecha) {
                                resolve(turno);
                            }
                        }
                        reject("El paciente no tiene este turno");
                    })
                    .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
    });
};

// Funcion que llena el menu de seleccion de pacientes con los pacientes disponibles
function cargarPacientesExistentes() {
    return new Promise(function(resolve, reject) {
        getAllPacientes()
            .then((pacientes) => {
                if (llenarSelectConOpciones(pacientes, "buscadorPacientes")) resolve("Pacientes cargados");
            })
            .catch((err) => {
                console.log(err);
                reject("No se pudieron cargar los pacientes.");
            });
    });
};

// Funcion que llena el menu de seleccion de especialistas con los especialistas disponibles
function cargarEspecialistasExistentes(permiso) {
    return new Promise(function(resolve, reject) {
        if (permiso == "true") {
            let input = document.getElementById("buscadorEspecialistas");
            input.innerHTML = '<option selected disabled value="">Seleccione...</option>';
            getAllEspecialistas()
                .then((especialistas) => {
                    if (llenarSelectConOpciones(especialistas, "buscadorEspecialistas")) resolve("Especialistas cargados.");
                })
                .catch((err) => {
                    console.log(err)
                    reject("No se pudieron cargar los especialistas");
                });
        } else {
            getUserLogeado()
                .then((especialista) => {
                    if (seleccionarEspecialistaActivo(especialista, "buscadorEspecialistas")) resolve("Especialistas cargados.");
                })
                .catch((err) => {
                    console.log(err);
                    reject("No se pudieron cargar los especialistas");
                });
        }
    });
};

// funcion que recibe el tipo de permiso que tiene la sesion activa, y carga el filtro de especialistas de la barra superior.
function cargarFiltroEspecialistas(permiso) {
    let input = document.getElementById("filtro-agenda");
    if (permiso == "true") {
        getAllEspecialistas()
            .then((especialistas) => {
                llenarSelectConOpciones(especialistas, "filtro-agenda");
            })
            .catch((err) => {
                console.log(err)

            });
        input.addEventListener('change', (event) => {
            cargarCalendario(event.target.value);
        });

    } else {
        getUserLogeado()
            .then((especialista) => {
                if (seleccionarEspecialistaActivo(especialista, "filtro-agenda")) cargarCalendario(especialista.dni);
            })
            .catch((err) => console.log(err));
    }
};

// funcion que recibe el especialista activo y lo habilita en los input select.
function seleccionarEspecialistaActivo(especialista, select) {
    let input = document.getElementById(select);
    input.innerHTML = "";
    let opcion = document.createElement("option");
    opcion.setAttribute("value", especialista.dni);
    opcion.setAttribute("disabled", "");
    opcion.setAttribute("selected", "");
    opcion.text = `${especialista.prefijo.toUpperCase()} ${especialista.lastname.toUpperCase()}, ${especialista.name.toUpperCase()}`;
    input.add(opcion, input[input.length]);
    return true;
};