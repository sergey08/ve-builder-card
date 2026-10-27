# 1.2.2-beta.1 — Estado de carga / Charging status

## Español

- Si hay una entidad de potencia real configurada, una lectura positiva muestra Cargando y anima la manguera aunque el estado del vehículo llegue con retraso.
- Potencia cero mantiene la manguera quieta. Una lectura no disponible se identifica como Sin datos de potencia, sin animación.
- Si no hay entidad de potencia configurada, se conserva el estado del vehículo como referencia.
- 33 pruebas superadas; pendiente comprobación visual en Home Assistant.

## English

- When a real charging power entity is configured, positive power shows Charging and animates the cable even if the vehicle status is delayed.
- Zero power keeps the cable still. Unavailable power is explicitly labelled Power unavailable, without animation.
- Without a configured power entity, vehicle charging state remains the fallback.
- 33 tests pass; visual verification in Home Assistant pending.
