class Alerta {
    constructor(mensaje = "", titulo = "") {
        this.mensaje = mensaje;
        this.titulo = titulo;
        this.alerta = $("#alerta");
    };

    configurar() {
        $("#titulo-alerta").text(this.titulo);
        $("#mensaje-alerta").text(this.mensaje);
    };

    mostrar() {
        this.configurar();
        this.alerta.show();
    };

}