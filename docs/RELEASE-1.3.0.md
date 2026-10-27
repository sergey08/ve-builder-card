# 1.3.0 — Antigüedad de lecturas / Reading age

## Español

- Nuevo indicador opcional de antigüedad por apartado, con límite configurable en minutos (60 por defecto).
- Permite elegir un sensor cuyo valor sea la fecha real de lectura. Acepta fechas ISO y marcas Unix en segundos o milisegundos.
- Muestra Última lectura y marca Datos antiguos al alcanzar el límite. Atenúa los valores informativos sin bloquear controles ni cambiar la lógica de carga.
- Sin sensor de fecha, muestra el cambio más antiguo de las entidades del apartado, identificado expresamente: un valor estable puede seguir siendo válido.
- Las fechas ausentes, inválidas o demasiado futuras se muestran como no disponibles.
- Actualiza el indicador cada minuto sin reconstruir la tarjeta; evita actualizaciones de tiempo con la página oculta y limpia el temporizador al retirar la tarjeta.
- Disponible en Editar → apartado → Antigüedad de las lecturas. Desactivado por defecto en configuraciones existentes.
- 38 pruebas automáticas superadas. Indicador visual confirmado en la instalación del mantenedor.
- Promoción de 1.3.0-beta.1 sin nuevos cambios funcionales.

## English

- New optional per-block reading age indicator with a configurable age limit in minutes (default 60).
- Select a sensor whose value is the actual reading timestamp. Supports ISO dates and Unix seconds or milliseconds.
- Show Last reading and flag Old data at the threshold. Dim informational values without blocking controls or changing charging logic.
- Without a timestamp sensor, explicitly show the oldest entity state change: an unchanged value can still be valid.
- Missing, invalid or excessively future dates are shown as unavailable.
- Update labels every minute without rebuilding the card; avoid time updates while hidden and clean up the timer when removed.
- Available in Edit → block → Reading age. Disabled by default for existing configurations.
- 38 automated tests pass. Indicator visually confirmed in the maintainer's installation.
- Promotes 1.3.0-beta.1 without additional functional changes.
