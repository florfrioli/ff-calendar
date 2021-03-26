var prefijosDisponibles = ["Dr.", "Dra.", "Lic."];
// --> Este Script trabaja con la pagina de Especialistas y la tabla.
// Los formularios para crear nuevos Especialistas y eliminar.

window.onload = mostrarEspecialistas;

// Función que carga el contenido de la página y agrega los eventos a los botones
function mostrarEspecialistas() {
    if (window.localStorage.getItem('login') == "true") {
        // Oculto las alertas
        $("#alerta").hide();

        // Menu lateral
        $('#sidebarCollapse').on('click', function() {
            $('#sidebar').toggleClass('active');
        });

        //Boton agregar nuevo paciente
        $(".agregarNuevoPaciente").on('click', agregarPaciente);

        //Boton agregar nuevo Especialista
        $(".agregarNuevoEspecialista").on('click', agregarEspecialista);

        //Boton salir
        $("#btn-sign-out").on('click', cerrarSesion);

        mostrarTabla();
        habilitarBuscadorEspecialistas();
    } else { window.location.href = "./index.html"; }
};

//Funcion que recibe una lista de especialistas y la renderiza en el html
function mostrarTablaEspecialistas(listaEspecialistas) {
    var tablabody = document.getElementById("body-tabla-esp");
    $("#body-tabla-esp").empty();
    for (let esp of listaEspecialistas) {
        let htmlEspecialista = document.createElement("tr");
        htmlEspecialista.innerHTML = '<th scope="row" >' + `${esp.lastname}, ${esp.name}` + '</th> <td>' + esp.dni + '</td> <td>' + esp.especialidad + ' </td> <td>' + esp.phone + '</td><td>' + esp.email + '</td> <td>' + '<a href="#" class="btn-modificar-especialista"><i class = "fas fa-user-cog"></i></a>' + '<a href="#" class="btn-eliminar-especialista"><i class = "fas fa-user-times"></i></a>' + '</td>';
        tablabody.appendChild(htmlEspecialista);
    };

    // Botones acciones de la tabla
    $('.btn-eliminar-especialista').on('click', function() {
        var fila = this.closest("tr");
        var dni = fila.getElementsByTagName("td")[0].innerText;
        confirmacionOperacion("especialista", dni)
            .then((resp) => {
                eliminar("ESPECIALISTA", dni)
                    .then((resp) => {
                        console.log(resp);
                        mostrarTabla();
                    })
                    .catch((err) => console.log(err));
                new Alerta("El especialista fue eliminado con éxito!", "Eliminar especialista").mostrar();
            })
            .catch((error) => {
                // Se anulo la operacion
            });
    });

    $('.btn-modificar-especialista').on('click', function() {
        var fila = this.closest("tr");
        var dni = fila.getElementsByTagName("td")[0].innerText;
        modificarEspecialista(dni);
    });
    let spinner = document.getElementById("spinner-especialistas");
    spinner.style.visibility = 'hidden'; //'hidden'
};

// Función que recolecta los datos del form - agregar un especialista y devuelve un json
function recolectarDatosDelFormEspecialista() {
    return especialista = {
        prefijo: document.getElementById('prefijo-esp').value,
        name: document.getElementById("nombre-esp").value,
        lastname: document.getElementById("apellido-esp").value,
        dni: document.getElementById("dni-esp").value,
        matricula: document.getElementById("matricula-esp").value,
        especialidad: document.getElementById("especialidad-esp").value,
        phone: document.getElementById("celular-esp").value,
        email: document.getElementById("email-esp").value
    };
};

// Devuelve una promesa con los datos recolectados en crear especialista
const recolectarDatos = () => {
    return new Promise(function(resolve, reject) {
        let form = document.getElementById('form-nuevo-especialista');
        form.addEventListener('submit', function(ev) {
            'use strict'
            ev.preventDefault();
            ev.stopPropagation();
            if (form.checkValidity()) {
                form.classList.add('was-validated');
                let datosEspecialista = recolectarDatosDelFormEspecialista();
                $("#modalNuevoEspecialista").modal('hide'); // oculto el form 
                resolve(datosEspecialista);
            } else {
                // Se queda hasta que sea valido
            }
        }, false);
    });
};

// Funcion que dispara el modal y recolecta datos del nuevo Especialista
function agregarEspecialista() {
    resetFormulario();
    document.getElementById("dni-esp").removeAttribute("disabled");
    document.getElementsByClassName("btn-form")[0].innerText = "AGREGAR";
    document.getElementById("titulo-nuevo-especialista").innerText = "Crear un nuevo especialista";
    $("#modalNuevoEspecialista").modal('show');
    recolectarDatos()
        .then((respuesta) => {
            postNuevo("ESPECIALISTA", respuesta)
                .then(resp => {
                    new Alerta(`Se creo el especialista con éxito!`, `Nuevo Especialista`).mostrar();
                    mostrarTabla();
                })
                .catch(err => {
                    new Alerta(err, `Nuevo Especialista`).mostrar();
                });
        })
        .catch((error) => {
            (new Alerta(error, "Nuevo Especialista")).mostrar();
        })
};

// Funcion que modifica un especialista, hace un put
function modificarEspecialista(dni) {
    $("#modalNuevoEspecialista").modal('show');
    document.getElementsByClassName("btn-form")[0].innerText = "GUARDAR";
    document.getElementById("titulo-nuevo-especialista").innerText = "Actualizar datos del paciente";
    rellenarElFormEspecialista(dni);
    document.getElementById("dni-esp").setAttribute("disabled", "");
    recolectarDatos()
        .then((respuesta) => {
            modificarUn("ESPECIALISTA", respuesta);
            document.getElementById("dni-esp").removeAttribute("disabled");
            (new Alerta("El especialista se modificó con éxito!", "Modificar Especialista")).mostrar();
            mostrarTabla();
        })
        .catch((error) => {
            (new Alerta(error, "Modificar Especialista")).mostrar();
            document.getElementById("dni-esp").removeAttribute("disabled");
        });
};

// Funcion que cuando se entra a modificar un especialista, carga sus valores en cada campo.
function rellenarElFormEspecialista(dni) {
    get("ESPECIALISTA", dni)
        .then((especialista) => {
            document.getElementById("nombre-esp").value = especialista.name;
            document.getElementById("prefijo-esp").value = especialista.prefijo.toUpperCase();
            document.getElementById("apellido-esp").value = especialista.lastname;
            document.getElementById("dni-esp").value = especialista.dni;
            document.getElementById("matricula-esp").value = especialista.matricula;
            document.getElementById("especialidad-esp").value = especialista.especialidad;
            document.getElementById("celular-esp").value = especialista.phone;
            document.getElementById("email-esp").value = especialista.email;
        })
        .catch((err) => console.log(err));
};

// Función que habilita un listener en el input buscador, y ante un cambio realiza el filtrado de la tabla de especialistas.
function habilitarBuscadorEspecialistas() {
    $(document).ready(function() {
        $("#buscador-pagina-especialistas").on("keyup", function() {
            var value = $(this).val().toLowerCase();
            $("#body-tabla-esp tr").filter(function() {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });
    });
};