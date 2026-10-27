# 1.4.0-beta.2 — Consejos de presión / Pressure advice

## Español

- Consejos opcionales en el mapa del vehículo, con referencia en frío y recordatorio de no desinflar neumáticos calientes.
- Perfiles de carga normal y plena carga con referencias por eje. Introduce exclusivamente los valores de la etiqueta del vehículo; no se inventan presiones ni se cambian por la estación del año.
- El perfil cambia la referencia visible; los umbrales de color y aviso se configuran por separado.
- Sensor opcional de temperatura exterior: admite °C y °F, rechaza lecturas de más de 30 minutos o demasiado futuras y muestra un consejo con 30 °C o más. No estima la temperatura del neumático.
- Sensor opcional con la fecha de fin del último trayecto: indica circulación reciente durante 2 horas. Sin evidencia suficiente muestra condición térmica desconocida, sin afirmar que las ruedas están frías.
- Actualización cada minuto sin reconstruir la tarjeta, suspendida con la página oculta.
- Disponible en Editar → Mapa del vehículo → Consejos y perfiles de presión. Desactivado por defecto.
- Incluye el resumen de avisos de beta.1. 47 pruebas automáticas superadas; pendiente de validación visual.

## English

- Optional vehicle diagram advice with cold pressure references and a reminder not to deflate hot tyres.
- Normal and full load profiles with per-axle references. Enter only vehicle label values; no invented pressures or seasonal automatic changes.
- The profile changes the displayed reference; colour and alert thresholds remain separately configurable.
- Optional outside temperature sensor: supports °C and °F, rejects readings older than 30 minutes or excessively future dates, and shows advice at 30 °C or above. Does not estimate tyre temperature.
- Optional last trip end timestamp sensor: indicates recent driving for 2 hours. Without sufficient evidence, shows unknown thermal condition rather than claiming cold tyres.
- Minute-based updates without rebuilding the card, paused while the page is hidden.
- Available in Edit → Vehicle diagram → Pressure advice and load profiles. Disabled by default.
- Includes the beta.1 alert summary. 47 automated tests pass; visual validation pending.
