# VE Builder Card 1.7.5-beta.1

## English

### What's new
- Adds native, compact horizontal energy bars for **Charging sources** in the **Costs and savings** block.
- Displays today's solar/grid charging energy (kWh) and their percentage of today's total charge.
- Exposes three configurable entity pickers in the visual editor: solar, grid, and total. Supports `sensor.*` and `input_number.*`.
- Handles unavailable readings explicitly and preserves existing saved cards, groups, prices, costs, and savings.

### Configure and validate
1. Update to this beta from Home Assistant Marketplace / HACS.
2. Open the VE Builder Card **Costs and savings** visual editor and assign three daily **energy** entities (kWh), not instantaneous power (W).
3. Example: solar `sensor.xpeng_energia_carga_solar_diaria`, grid `input_number.xpeng_energia_carga_red_diaria`, total `sensor.energia_cargada_diaria`.
4. Validate visually on desktop and mobile. No settings are changed automatically.

**Status:** automated tests and HACS validation are used for build checks; actual Home Assistant rendering requires user confirmation. Do not release stable until approved.

## Español

### Novedades
- Añade barras horizontales compactas nativas para **Fuentes de carga** en el bloque **Gastos y ahorro**.
- Muestra la energía solar y de red cargada hoy (kWh) y el porcentaje respecto al total diario.
- Incorpora tres selectores de entidades al editor visual: solar, red y total. Admite `sensor.*` e `input_number.*`.
- Trata expresamente las lecturas no disponibles y mantiene las tarjetas, precios, costes y ahorros ya configurados.

### Configuración y validación
1. Actualiza a esta beta desde Marketplace / HACS.
2. En el editor visual de **Gastos y ahorro**, selecciona tres entidades de **energía diaria** (kWh), no de potencia instantánea (W).
3. Ejemplo: solar `sensor.xpeng_energia_carga_solar_diaria`, red `input_number.xpeng_energia_carga_red_diaria`, total `sensor.energia_cargada_diaria`.
4. Valida el diseño en ordenador y móvil. Ningún ajuste se cambia automáticamente.

**Estado:** las pruebas automáticas y HACS comprueban la compilación; el aspecto real en Home Assistant requiere la confirmación del usuario. No publicar estable antes de su aprobación.
