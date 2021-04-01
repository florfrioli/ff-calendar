const URL_PACIENTE = "http://localhost:8080/api/paciente";
const URL_ESPECIALISTA = `http://localhost:8080/api/especialista`;
const URL_TURNO = `http://localhost:8080/api/turno`;
const URL_TURNOS_PACIENTE = `http://localhost:8080/api/turno/paciente`;
const URL_TURNOS_ESPECIALISTA = `http://localhost:8080/api/turno/especialista`;
const URL_USER_LOGEADO = `http://localhost:8080/api/user`;
const URL_CHECK_USER = `http://localhost:8080/api/check-user`;
const URL_SIGNUP = `http://localhost:8080/api/user/signup`;
const TOKEN = window.localStorage.getItem('token');

// Métodos a la api

// ------> POST
const postAPI = (url, data) => {
    return new Promise((resolve, reject) => {
        var xhttp;
        xhttp = new XMLHttpRequest();

        xhttp.addEventListener("readystatechange", function() { // Ver el estado para resolver la promesa
            if (this.readyState === 4) {
                console.log(this.status);
                if (this.status >= 200 && this.status < 400) {
                    console.log(this.response);
                    resolve(this.response);
                } else {
                    reject(this.response);
                }
            }
        });
        xhttp.open("POST", url, true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + TOKEN);
        xhttp.send(data);
    });
};

// ------> PUT
const putAPI = (url, data) => {
    return new Promise((resolve, reject) => {
        var xhttp;
        xhttp = new XMLHttpRequest();

        xhttp.addEventListener("readystatechange", function() { // Ver el estado para resolver la promesa
            if (this.readyState === 4) {
                console.log(this.status);
                if (this.status >= 200 && this.status < 400) {
                    resolve(this.response);
                } else {
                    reject(this.response);
                }
            }
        });
        xhttp.open("PUT", url, true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + TOKEN);
        xhttp.send(data);
    });
};

// ------> GET
const getAPI = (url, id = "") => {
    return new Promise((resolve, reject) => {
        var xhttp;
        xhttp = new XMLHttpRequest();
        let urlFinal = `${url}${id}`;
        xhttp.addEventListener("readystatechange", function() { // Ver el estado para resolver la promesa
            if (this.readyState === 4) {
                if (this.status >= 200 && this.status < 400) {
                    resolve(this.response);
                } else {
                    if (JSON.parse(this.response).error == 'Token vencido') {
                        console.log('Token vencido');
                    }
                    reject(this.response);
                }
            }
        });
        xhttp.open("GET", urlFinal, true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + TOKEN);
        xhttp.send();
    });
};

// --> GET ALL
const getAllColection = (url) => {
    return new Promise((resolve, reject) => {
        var xhttp;
        xhttp = new XMLHttpRequest();
        xhttp.addEventListener("readystatechange", function() { // Ver el estado para resolver la promesa
            if (this.readyState === 4) {
                console.log(this.status);
                if (this.status >= 200 && this.status < 400) {
                    resolve(JSON.parse(this.response));
                } else {
                    if (JSON.parse(this.response).error == 'Token vencido') {
                        tokenVencido();
                        console.log('Token vencido');
                    }
                    reject(this.response);
                }
            }
        });
        xhttp.open("GET", url, true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + TOKEN);
        xhttp.send();
    });
};

// ------> DELETE
const deleteAPI = (url) => {
    return new Promise((resolve, reject) => {
        var xhttp;
        xhttp = new XMLHttpRequest();

        xhttp.addEventListener("readystatechange", function() { // Ver el estado para resolver la promesa
            if (this.readyState === 4) {
                console.log(this.status);
                if (this.status >= 200 && this.status < 400) {
                    resolve(this.response);
                } else {
                    reject(this.response);
                }
            }
        });
        xhttp.open("DELETE", url, true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.setRequestHeader("Authorization", "Bearer " + TOKEN);
        xhttp.send();
    });
};

// -- > POST PARTICULARES:
const postNuevo = (tipo, data) => {
    return new Promise((resolve, reject) => {
        let url = "";
        if (tipo.toUpperCase() == "PACIENTE") {
            url = URL_PACIENTE;
        } else if (tipo.toUpperCase() == "ESPECIALISTA") { url = URL_ESPECIALISTA; }
        postAPI(url, JSON.stringify(data))
            .then((response) => {
                resolve();
            })
            .catch((error) => {
                let msjError = JSON.parse(error).error;
                console.log(msjError);
                reject(msjError);
            });
    });
};

// --> POST TURNO ES DISTINTO, necesito que me devuelva una promesa.
const postTurno = (newTurno) => {
    return new Promise((resolve, reject) => {
        postAPI(URL_TURNO, JSON.stringify(newTurno))
            .then((response) => {
                resolve();
            })
            .catch((error) => {
                let msjError = JSON.parse(error).error;
                console.log(msjError);
                reject(msjError);
            });
    });
};

// --> POST para checkear usuario
const checkUser = (email) => {
    return new Promise((resolve, reject) => {
        postAPI(URL_CHECK_USER, JSON.stringify(email))
            .then((response) => {
                resolve();
            })
            .catch((error) => {
                let msjError = JSON.parse(error).error;
                reject(msjError);
            });
    });
};

// --> POST registro usuario en midb
const signUp = (data) => {
    return new Promise((resolve, reject) => {
        postAPI(URL_SIGNUP, JSON.stringify(data))
            .then((response) => {
                resolve();
            })
            .catch((error) => {
                let msjError = JSON.parse(error).error;
                reject(msjError);
            });
    });
};

// -- > GET ALL particulares:
const getAllPacientes = () => {
    return new Promise((resolve, reject) => {
        getAllColection(URL_PACIENTE)
            .then((resp) => resolve(resp.paciente))
            .catch((err) => reject(err));
    });
};

const getAllEspecialistas = () => {
    return new Promise((resolve, reject) => {
        getAllColection(URL_ESPECIALISTA)
            .then((resp) => resolve(resp.especialista))
            .catch((err) => reject(err));
    });
};

const getAllTurnos = () => {
    return new Promise((resolve, reject) => {
        getAllColection(URL_TURNO)
            .then((resp) => resolve(resp.turno))
            .catch((err) => reject(err));
    });
};

// ---> GET particulares
// GET PACIENTE O GET ESPECIALISTA
function get(tipo, idoDni) {
    let url = "";
    if (tipo.toUpperCase() == "PACIENTE") {
        url = URL_PACIENTE;
    } else if (tipo.toUpperCase() == "ESPECIALISTA") {
        url = URL_ESPECIALISTA;
    }
    return new Promise((resolve, reject) => {
        getAPI(url, `/${idoDni}`)
            .then((response) => {
                var resultado = "";
                if (tipo.toUpperCase() == "PACIENTE") {
                    resultado = JSON.parse(response).paciente;
                } else if (tipo.toUpperCase() == "ESPECIALISTA") {
                    resultado = JSON.parse(response).especialista;
                }
                resolve(resultado);
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            })
    });
};

//GET USUARIO LOGEADO POR TOKEN
function getUserLogeado() {
    return new Promise((resolve, reject) => {
        getAPI(URL_USER_LOGEADO)
            .then((response) => {
                var especialista = JSON.parse(response).especialista;
                resolve(especialista);
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            })
    });
};

// GET TURNOS DE PACIENTE/ESPECIALISTA
function getTurnosDe(tipo, unID) {
    let url = "";
    if (tipo.toUpperCase() == "PACIENTE") {
        url = URL_TURNOS_PACIENTE;
    } else if (tipo.toUpperCase() == "ESPECIALISTA") {
        url = URL_TURNOS_ESPECIALISTA;
    }
    return new Promise((resolve, reject) => {
        getAPI(url, `/${unID}`)
            .then((response) => {
                resolve(JSON.parse(response).turnos);
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            })
    });
};

// --> DELETE:
// Eliminar un especialista o un paciente
function eliminar(tipo, dnioId) {
    let url = "";
    if (tipo.toUpperCase() == "PACIENTE") {
        url = URL_PACIENTE;
    } else if (tipo.toUpperCase() == "ESPECIALISTA") {
        url = URL_ESPECIALISTA;
    }
    return new Promise((resolve, reject) => {
        deleteAPI(`${url}?dni=${dnioId}`)
            .then((response) => {
                resolve("eliminado con exito!");
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            })
    });
}

// Eliminar un turno
function deleteTurno(idTurno) {
    return new Promise((resolve, reject) => {
        deleteAPI(`${URL_TURNO}?id=${idTurno}`)
            .then((response) => {
                resolve("eliminado con exito!");
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            })
    });
};

// --> PUT
// -->PUT NUEVO TURNO
function putTurnoNuevoEstado(id, nuevoEstado) {
    return new Promise((resolve, reject) => {
        putAPI(`${URL_TURNO}/${id}`, JSON.stringify({ estado: nuevoEstado }))
            .then((response) => {
                resolve("correcto");
            })
            .catch((error) => {
                let msjError = JSON.parse(error).error;
                console.log(msjError);
                new Alerta(msjError, "Nuevo Turno").mostrar();
                reject(msjError);
            });
    });
};

// -->MODIFICAR UN PACIENTE/ESPECIALISTA
function modificarUn(tipo, persona) {
    let url = "";
    if (tipo.toUpperCase() == "PACIENTE") {
        url = URL_PACIENTE;
    } else if (tipo.toUpperCase() == "ESPECIALISTA") {
        url = URL_ESPECIALISTA;
    }
    return new Promise((resolve, reject) => {
        putAPI(`${url}/${persona.dni}`, JSON.stringify(persona))
            .then((response) => {
                resolve("correcto");
                new Alerta(`${tipo.toLowerCase()} modificado con éxito!`, `Modificar ${tipo.toLowerCase()}`).mostrar();
            })
            .catch((error) => {
                let msjError = JSON.parse(error).error;
                console.log(msjError);
                new Alerta(msjError, `Modificar ${tipo.toLowerCase()}`).mostrar();
                reject(msjError);
            });
    });
};