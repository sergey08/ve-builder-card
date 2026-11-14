# VE Builder Card 1.7.5-beta.3

## English

- **Charging sources** supports both instantaneous power (W/kW) and daily charged energy (kWh/Wh) using the existing horizontal bars.
- Set `mode: energy` (Daily energy in the visual editor) for daily totals; `mode: power` keeps the previous behavior; Automatic detects kWh/Wh on sensors.
- Sensor and `input_number` entity selectors support grid energy from a helper. No mixing of W with kWh, no animation of daily totals.
- Existing configurations remain intact. Nothing is automatically modified in dashboards.

### Suggested XPeng G6 setup
```yaml
charging_sources:
  mode: energy
  solar_entity: sensor.xpeng_energia_carga_solar_diaria
  grid_entity: input_number.xpeng_energia_carga_red_diaria
  total_entity: sensor.energia_cargada_diaria
```

**Validation:** CI must complete before testing on Home Assistant. Use the Marketplace/HACS beta selector and check the bars on desktop/mobile before any stable release.

## Español

- **Fuentes de carga** admite potencia instantánea (W/kW) y energía cargada durante el día (kWh/Wh) en las barras horizontales existentes.
- Selecciona `mode: energy` (Energía diaria en el editor visual) para los acumulados del día; `mode: power` conserva el comportamiento anterior; Automático detecta kWh/Wh en los sensores.
- Los selectores admiten sensores y entidades `input_number`, incluida la energía de red procedente de un ayudante. Sin mezclar W y kWh, sin animación de acumulados diarios.
- Se conservan las configuraciones anteriores. No se modifica automáticamente ningún panel.

### Configuración recomendada para XPeng G6
```yaml
charging_sources:
  mode: energy
  solar_entity: sensor.xpeng_energia_carga_solar_diaria
  grid_entity: input_number.xpeng_energia_carga_red_diaria
  total_entity: sensor.energia_cargada_diaria
```

**Validación:** completar CI antes de probar en Home Assistant. Seleccionar la beta desde Marketplace/HACS y comprobar las barras en ordenador y móvil antes de liberar una estable.
