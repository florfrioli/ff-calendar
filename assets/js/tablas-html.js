mostrarTabla = () => {
    // Depende el html en el que se encuentre carga la info
    var pathname = window.location.pathname;
    if (pathname == "/especialistas.html") {
        let spinner = document.getElementById("spinner-especialistas");
        spinner.style.visibility = 'visible'; //'hidden'
        getAllEspecialistas()
            .then((respuesta) => {
                let especialistasLista = respuesta;
                //Ordena alfabeticamente la lista
                let especialistasOrdenados = ordenarAlfabeticamente(especialistasLista);
                //Cargo la tabla
                mostrarTablaEspecialistas(especialistasOrdenados);
            })
            .catch((err) => console.log("vacio" + err));
    } else if (pathname == "/pacientes.html") {
        prepararTabla()
            .then(resp => {
                getAllPacientes()
                    .then((respuesta) => {
                        let pacienteslista = respuesta;
                        //Ordena alfabeticamente la lista
                        let pacientesOrdenados = ordenarAlfabeticamente(pacienteslista);
                        //Cargo la tabla
                        mostrarTablaPacientes(pacientesOrdenados);
                    })
                    .catch((err) => console.log("vacio"));
            })
    }
};

const prepararTabla = () => {
    return new Promise((resolve, reject) => {
        let spinner = document.getElementById("spinner-pacientes");
        spinner.style.visibility = 'visible'; //'hidden'
        resolve();
    });
};