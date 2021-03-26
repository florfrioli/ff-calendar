// Script con la configuracion de firebase y el manejo de la pagina index
var firebaseConfig = {
    apiKey: "AIzaSyCFqOFnOj_AV-nk1zd1LQH_jlPMKrtKKbI",
    authDomain: "ff-calendar-2021.firebaseapp.com",
    projectId: "ff-calendar-2021",
    storageBucket: "ff-calendar-2021.appspot.com",
    messagingSenderId: "1097980377620",
    appId: "1:1097980377620:web:fa1a1920490788f62ec501"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(); // objeto para conectarme a firebase

window.onload = pantallaInicio;

function pantallaInicio() {
    // Click en crear nuevo usuario
    document.querySelector("#nuevo-usuario-form").addEventListener("submit", (e) => {
        e.preventDefault();
        // Junto los datos del form
        document.getElementById("mensaje-error").innerText = "";
        let password = document.getElementById("clave-nuevo-usuario").value;
        let email = document.getElementById("email-nuevo-usuario").value;
        checkUser({ email })
            .then((respuesta) => {
                auth.createUserWithEmailAndPassword(email, password)
                    .then(userCredential => {
                        auth.currentUser.getIdToken()
                            .then((token) => {
                                if (token) {
                                    signUp({ email, password, token }) //postAPI(`http://localhost:8080/api/user/signup`, JSON.stringify({ email, password, token }))
                                        .then((resp) => console.log(JSON.parse(resp).ok))
                                        .catch((err) => console.log(err));
                                    console.log("Registrado correctamente");
                                    $("#modalRegistro").modal('show');
                                    setTimeout(function() {
                                        $("#modalRegistro").modal('hide');
                                        window.location.href = "./index.html";
                                    }, 3500);
                                }
                            })
                            .catch((err) => console.log(err));
                    })
                    .catch(error => mostrarErrorSignUp(error));
            })
            .catch(err => console.log(err));
    });

    // Click en iniciar sesion
    document.querySelector("#inicio-sesion-form").addEventListener("submit", (e) => {
        e.preventDefault();
        document.getElementById("mensaje-error").innerText = "";
        let password = document.getElementById("clave-inicio-sesion").value;
        let email = document.getElementById("email-inicio-sesion").value;
        auth.
        signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                console.log("Inicio correctamente");
                postAPI(`http://localhost:8080/api/user/signin`, JSON.stringify({ email }))
                    .then((resp) => {
                        almacenarTokenYPermisos(resp);
                        $("#modalBienvenido").modal('show');
                        $("input").value = "";
                        setTimeout(function() {
                            $("#modalBienvenido").modal('hide');
                            window.location.href = "./agenda.html";
                        }, 3000);
                    })
                    .catch((err) => console.log(err));
            }).catch(error => mostrarErrorSignIn(error));
    });

    // Olvidaste tu contraseña
    document.querySelector("#olvidaste-clave").addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("mensaje-error").innerText = "";
        let mail = document.getElementById("email-inicio-sesion").value;
        recuperarClave(mail);
        //console.log("enviando " + clave + " - " + mail);
    });
}

// Conecta con firebase
function recuperarClave(email) {
    auth.sendPasswordResetEmail(email).then(function() {
        document.getElementById("mensaje-error").innerText = "Se envío un email a la dirección indicada.";
    }).catch(function(error) {
        document.getElementById("mensaje-error").innerText = "Error.";
    });

};

// Cierra sesion y elimina localstorage
function cerrarSesionFirebase() {
    auth.signOut().then(() => {
        window.localStorage.setItem('login', "false");
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('admin');
        window.location.href = "./index.html";
    }).catch((error) => {
        // An error happened.
    });
};

// Muestra los errores de registro
function mostrarErrorSignUp(error) {
    if (error.code == "auth/weak-password") {
        document.getElementById("mensaje-error-nuevo").innerText = "La contraseña debe contener al menos 6 caracteres."
    } else if (error.code == "auth/email-already-in-use") {
        document.getElementById("mensaje-error-nuevo").innerText = "Error: El email ya fue registrado anteriormente."
    }
};

// Muestra los errores de logueo
function mostrarErrorSignIn(error) {
    if (error.code == "auth/wrong-password") {
        document.getElementById("mensaje-error").innerText = "La contraseña ingresada es incorrecta."
    } else if (error.code == "auth/user-not-found") {
        document.getElementById("mensaje-error").innerText = "Error: Usuario no registrado."
    } else {
        document.getElementById("mensaje-error").innerText = "Error. Intente nuevamente."
    }
};

// Persiste la sesion en localstorage
function almacenarTokenYPermisos(info) {
    let token = JSON.parse(info).token;
    let permisos = JSON.parse(info).admin;
    window.localStorage.setItem("login", "true");
    window.localStorage.setItem("token", token);
    window.localStorage.setItem("admin", permisos);
};