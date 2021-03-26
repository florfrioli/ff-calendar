// Script que tiene el elemento FullCalendar:
var calendarEl = document.getElementById('calendar');
// Creo una instancia Calendario
var calendar = new FullCalendar.Calendar(calendarEl, {
    // Tipo de vista semanalaboral (definida luego)
    initialView: 'semanaLaboral',
    // Tema de bootstrap
    themeSystem: 'bootstrap',
    locale: 'es',
    // Se pueden seleccionar elementos del calendario
    selectable: true,
    // Configuración de los eventos
    displayEventTime: true,
    //eventColor: '#593196',
    // Vistas
    initialView: 'semanaLaboral',
    views: {
        listDay: {
            buttonText: 'día',
            dayHeaderFormat: {
                weekday: 'short',
                day: '2-digit',
                month: 'short'
            },
            slotLabelFormat: {
                hour: 'numeric',
                minute: '2-digit',
                omitZeroMinute: false,
                meridiem: false,
                hour12: false
            }
        },
        semanaLaboral: {
            buttonText: 'semana',
            // Tipo, vista con horarios
            type: 'timeGrid',
            // De lunes a sabados
            duration: { days: 6 },
            //Formato del header del dia
            dayHeaderFormat: {
                weekday: 'short',
                day: '2-digit',
                month: 'short'
            },
            //Formato del horario de la fila
            slotLabelFormat: {
                hour: 'numeric',
                minute: '2-digit',
                omitZeroMinute: false,
                meridiem: false,
                hour12: false
            }
        },
        dayGridMonth: {
            buttonText: 'mes',
            dayHeaderFormat: {
                weekday: 'long'
            },
            slotLabelFormat: {
                hour: 'numeric',
                minute: '2-digit',
                omitZeroMinute: false,
                meridiem: false,
                hour12: false
            }
        }
    },
    // No muestra el allday
    allDaySlot: false,
    // Duración de cada bloque
    slotDuration: '00:15:00',
    // Primer horario
    slotMinTime: '08:30:00',
    // Ultimo horario
    slotMaxTime: '19:30:00',
    // Que se muestra en el toolbar
    headerToolbar: {
        start: 'dayGridMonth,semanaLaboral,listDay', // myCustomButton ', // will normally be on the left. if RTL, will be on the right
        center: 'title',
        end: 'today prev,next' // will normally be on the right. if RTL, will be on the left
    },
    aspectRatio: 1,
    // Al hacer click:
    dateClick: function(info) {
        agregarEvento(info.dateStr);
    },
    eventClick: function(info) {
        mostrarDatosDelTurno(info);
    }
});

// Carga y recarga del calendario segun permisos.
function cargarCalendario(especialista = "todos") {
    let eventosActuales = calendar.getEvents();
    for (let ev of eventosActuales) {
        ev.remove();
    }
    if (especialista === "todos") {
        getAllTurnos()
            .then((listaTurnos) => {
                for (ev of listaTurnos) {
                    calendar.addEvent(ev);
                }
            })
            .catch((err) => console.log(err));
    } else {
        get("ESPECIALISTA", especialista)
            .then((resp) => {
                getTurnosDe("ESPECIALISTA", resp._id)
                    .then((listaTurnos) => {
                        for (ev of listaTurnos) {
                            calendar.addEvent(ev);
                        }
                    })
                    .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
    }
};

calendar.render();