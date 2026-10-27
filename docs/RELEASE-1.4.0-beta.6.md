# 1.4.0-beta.6 — Temperatura según ubicación / Location-based temperature

## Español

- Nuevo origen opcional «Según la ubicación» en los consejos de presión.
- Selecciona la entidad de ubicación, el estado que significa en casa, el sensor exterior de casa y el del vehículo para cuando esté fuera.
- En casa usa exclusivamente el sensor de casa; fuera usa exclusivamente el del vehículo. No reutiliza temperaturas de otra ubicación ante lecturas no disponibles.
- Con ubicación desconocida no elige temperatura. Muestra el contexto en casa/fuera y el origen en Más información.
- Conserva el modo sensor fijo y las configuraciones existentes. Sin cambios en presiones, colores ni controles.
- 54 pruebas automáticas superadas; pendiente de validación visual y cambio real de ubicación.

## English

- Optional «Based on location» temperature source in pressure advice.
- Configure the location entity, state meaning home, home outside sensor and vehicle outside sensor for away use.
- At home uses only the home sensor; away uses only the vehicle sensor. No fallback to a different location when readings are unavailable.
- Unknown location selects no temperature. Shows home/away context and source under More information.
- Preserves fixed sensor mode and existing configurations. No changes to pressure references, colours or controls.
- 54 automated tests pass; visual validation and a real location transition remain pending.
