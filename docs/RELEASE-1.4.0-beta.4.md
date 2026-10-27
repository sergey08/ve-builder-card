# 1.4.0-beta.4 — Fechas claras / Clear timestamps

## Español

- El mapa muestra «Última actualización del vehículo» para la fecha general procedente del sensor configurado.
- Las fechas individuales de las ruedas se identifican como «Último cambio»: corresponden a last_updated de Home Assistant, no necesariamente a la última recepción de telemetría.
- Una presión sin cambios puede conservar una fecha anterior aunque la integración siga recibiendo datos. La tarjeta no afirma que cada sensor se haya leído en la fecha general.
- Conserva la distinción «Cambio más antiguo» cuando no se configura sensor de fecha.
- 49 pruebas automáticas superadas; pendiente de comprobación visual.

## English

- The vehicle diagram labels the configured general timestamp as «Last vehicle update».
- Individual tyre timestamps are labelled «Last change»: they reflect Home Assistant last_updated rather than necessarily the latest telemetry reception.
- Unchanged pressure may retain an older timestamp while the integration continues receiving data. The card does not claim every sensor was read at the general timestamp.
- Preserves «Oldest state change» when no timestamp sensor is configured.
- 49 automated tests pass; visual validation pending.
