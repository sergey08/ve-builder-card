# 1.3.0-beta.1 — Antigüedad de lecturas / Reading age

## Español

- Aviso opcional de antigüedad por apartado, con tiempo configurable y sensor de fecha de lectura.
- Muestra la última lectura y marca Datos antiguos al superar el límite; atenúa valores informativos sin bloquear acciones ni alterar el estado de carga.
- Sin sensor de fecha, usa el cambio más antiguo de las entidades y lo identifica expresamente. Un estado estable no demuestra que el vehículo haya dejado de informar.
- Fechas ausentes, inválidas o demasiado futuras se identifican como no disponibles. Acepta fechas ISO y marcas Unix en segundos o milisegundos.
- El texto se actualiza cada minuto sin reconstruir la tarjeta; pausa las actualizaciones de tiempo con la página oculta y limpia el temporizador al retirar la tarjeta.
- Configuración existente intacta: función desactivada por defecto. 38 pruebas superadas; revisión visual pendiente.

## English

- Optional per-block reading age with a configurable age limit and reading timestamp sensor.
- Display last reading age and flag Old data at the threshold; dim informational values without blocking actions or changing charging status.
- Without a timestamp sensor, report the oldest entity state change explicitly. An unchanged state does not prove that reporting stopped.
- Missing, invalid or excessively future dates are unavailable. Supports ISO dates and Unix seconds or milliseconds.
- Update labels every minute without rebuilding the card; pause time updates when hidden and clean up the timer when removed.
- Existing configurations remain unchanged: disabled by default. 38 tests pass; visual validation pending.
