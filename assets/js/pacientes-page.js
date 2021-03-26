// --> Este Script trabaja con la pagina de pacientes y la tabla.
// Los formularios para crear nuevos pacientes y eliminar.

window.onload = mostrarPacientes;

// Funcion que carga la pagina dee pacientes y agrega eventos a los clicks
function mostrarPacientes() {
    if (window.localStorage.getItem('login') == "true") {
        // Oculto las alertas
        $("#alerta").hide();

        // Al cerrar la alerta recarga la pag
        $("#cierre-modal-info").on("click", function() {
            location.reload();
        });

        // Menu lateral
        $('#sidebarCollapse').on('click', function() {
            $('#sidebar').toggleClass('active');
        });

        //Boton agregar nuevo paciente
        $(".agregarNuevoPaciente").on('click', agregarPaciente);

        //Boton agregar nuevo Especialista
        $(".agregarNuevoEspecialista").on('click', agregarEspecialista);

        // Click salir
        $("#btn-sign-out").on('click', cerrarSesion);

        // Carga la tabla
        mostrarTabla(); // Buscador pacientes:
        habilitarBuscadorPacientes();
    } else window.location.href = "./index.html";
};

// Función que recolecta los datos del form y devuelve un json paciente- agregar un paciente
function recolectarDatosDelFormPacientes() {
    return paciente = {
        name: document.getElementById("name").value,
        lastname: document.getElementById("lastname").value,
        dni: document.getElementById("dni").value,
        obraSocial: document.getElementById("obraSocial").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value
    };
};

// Funcion que dispara el modal y recolecta datos del nuevo paciente
function agregarPaciente() {
    resetFormulario();
    document.getElementById("dni").removeAttribute("disabled");
    document.getElementsByClassName("btn-form")[0].innerText = "AGREGAR";
    document.getElementById("titulo-nuevo-paciente").innerText = " Crear nuevo paciente";
    $("#modalNuevoPaciente").modal('show');
    recolectarDatosPaciente()
        .then((respuesta) => {
            postNuevo("PACIENTE", respuesta)
                .then(resp => {
                    new Alerta(`Se creo el paciente con éxito!`, `Nuevo Paciente`).mostrar();
                    mostrarTabla();
                })
                .catch(err => {
                    new Alerta(err, `Nuevo Paciente`).mostrar();
                });
        })
        .catch((error) => {
            (new Alerta(error, "Nuevo Paciente")).mostrar();
        }); // No debería entrar acá porque no reject la promesa.
};

// Devuelve una promesa con los datos del nuevo paciente
const recolectarDatosPaciente = () => {
    return new Promise(function(resolve, reject) {
        let form = document.getElementById('form-nuevo-paciente');
        form.addEventListener('submit', function(ev) {
            'use strict'
            ev.preventDefault();
            ev.stopPropagation();
            let checked = form.checkValidity();
            if (checked) {
                form.classList.add('was-validated');
                let datosPaciente = recolectarDatosDelFormPacientes();
                $("#modalNuevoPaciente").modal('hide'); // oculto el form 
                resolve(datosPaciente);
            } else {
                // Espera hasta que sea válido el
            }
        }, false);
    });
};

// Funcion que modifica un paciente, hace un put
function modificarPaciente(dni) {
    //console.log("Entra a crear evento");
    $("#modalNuevoPaciente").modal('show');
    document.getElementsByClassName("btn-form")[0].innerText = "GUARDAR";
    document.getElementById("titulo-nuevo-paciente").innerText = "   Actualizar datos del paciente";
    rellenarElForm(dni);
    document.getElementById("dni").setAttribute("disabled", "");
    recolectarDatosPaciente()
        .then((respuesta) => {
            modificarUn("PACIENTE", respuesta);
            document.getElementById("dni").removeAttribute("disabled");
            (new Alerta("El paciente se modificó con éxito!", "Modificar Paciente")).mostrar();
            mostrarTabla();
        })
        .catch((error) => {
            (new Alerta(error, "Modificar Paciente")).mostrar();
            document.getElementById("dni").removeAttribute("disabled");
        });
};

// Funcion que cuando se entra a modificar un paciente, carga sus valores en cada campo.
function rellenarElForm(dni) {
    get("PACIENTE", dni)
        .then((paciente) => {
            document.getElementById("name").value = paciente.name;
            document.getElementById("lastname").value = paciente.lastname;
            document.getElementById("dni").value = paciente.dni;
            document.getElementById("obraSocial").value = paciente.obraSocial.toUpperCase();
            document.getElementById("phone").value = paciente.phone;
            document.getElementById("email").value = paciente.email;
        })
        .catch((err) => console.log(err));
};

//Funcion que recibe una lista de especialistas y la renderiza en el html
function mostrarTablaPacientes(listaPacientes) {
    var tablabody = document.getElementById("body-tabla-pacientes");
    $("#body-tabla-pacientes").empty();
    for (let paciente of listaPacientes) {
        let row = document.createElement("tr");
        row.innerHTML = '<th scope="row" >' + `${paciente.lastname}, ${paciente.name}` + '</td> <td>' +
            paciente.dni + '</td> <td>' + paciente.obraSocial.toUpperCase() + '</td> <td>' + paciente.phone + ' </td> <td>' + paciente.email + ' </td> <td>' + '<a href="#" class="btn-mas-info"><i class = "fas fa-calendar-alt"></i></a> ' + '<a href="#" class="btn-modificar-paciente"><i class = "fas fa-user-cog"></i></a>' + '<a href="#" class="btn-eliminar-paciente"><i class = "fas fa-user-times"></i></a>' + '</td>';
        tablabody.appendChild(row);
    };

    // Botones de mostrar mas info del paciente
    $('.btn-mas-info').on('click', function() {
        var fila = this.closest("tr"); // esto te devuelve la fila del boton clickeado
        var dni = fila.getElementsByTagName("td")[0].innerText; // te devuelve la columna dni
        mostrarMasInfoPaciente(dni); // hago lo que necesito con ese dni --> borrarCliente(dni)
    });

    // Botones de eliminar paciente
    $('.btn-eliminar-paciente').on('click', function() {
        var fila = this.closest("tr");
        var dni = fila.getElementsByTagName("td")[0].innerText;
        confirmacionOperacion("pacientes", dni)
            .then((respuesta) => {
                eliminar("PACIENTE", dni)
                    .then((resp) => {
                        console.log(resp)
                        mostrarTabla();
                    })
                    .catch((err) => console.log(err));
                new Alerta("El paciente fue eliminado con éxito!", "Eliminar paciente").mostrar();
            })
            .catch((error) => {
                // Se anuló la operación de borrar.
            });
    });
    // Botones de modificar paciente
    $('.btn-modificar-paciente').on('click', function() {
        var fila = this.closest("tr");
        var dni = fila.getElementsByTagName("td")[0].innerText;
        console.log("dni elegido" + dni);
        modificarPaciente(dni);
    });
    let spinner = document.getElementById("spinner-pacientes");
    spinner.style.visibility = 'hidden'; //'hidden'
};

// Funcion que muestra el modal y carga la info del paciente presionado al modal.
function mostrarMasInfoPaciente(unDNIPaciente) {
    $("#modal-info-paciente").modal('show');
    get("PACIENTE", unDNIPaciente)
        .then((paciente) => {
            document.getElementById("dato-fecha-turno").innerText = paciente.lastname + ", " + paciente.name + " - turnos anteriores:";
            getTurnosDe("PACIENTE", paciente._id)
                .then((historialTurnos) => {
                    agregarListaDeTurnos(historialTurnos);
                })
                .catch((err) => console.log(err));
        })
        .catch((error) => {
            console.log(error);
        });
};

// Recibe una lista y los muestra en el modal del paciente
function agregarListaDeTurnos(historialTurnos) {
    // Ordena por fecha
    let historialOrdenado = ordenarFechasDecreciente(historialTurnos);
    let body = document.getElementById("body-turnos-paciente");
    for (let turno of historialOrdenado) {
        let row = document.createElement("tr");
        row.innerHTML = '<th scope="row" >' + `${turno.dia}-${turno.mes}-${turno.anio}` + '</th> <td>' +
            `${turno.hora}:${turno.minutos} hs.` + '</td> <td>' + turno.estado + '</td>';
        body.appendChild(row);
    }
};

// Función que habilita un listener en el input buscador, y ante un cambio realiza el filtrado de la tabla de pacientes.
function habilitarBuscadorPacientes() {
    $(document).ready(function() {
        $("#buscador-pagina-pacientes").on("keyup", function() {
            var value = $(this).val().toLowerCase();
            $("#body-tabla-pacientes tr").filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });
    });
}