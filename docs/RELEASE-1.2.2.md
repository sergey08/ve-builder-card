# 1.2.2 — Estado de carga fiable / Reliable charging status

## Español

- Si hay una entidad de potencia real configurada, una lectura positiva muestra **Cargando** y anima la manguera aunque el estado del vehículo llegue con retraso.
- Corrige el caso en el que el cargador ya suministra energía, pero el vehículo sigue informando Connected y la tarjeta muestra Conectado · Sin carga.
- Potencia cero mantiene la manguera visible y quieta cuando el conector está conectado.
- Una lectura de potencia no disponible se muestra como **Conectado · Sin datos de potencia**, sin animación, cuando el conector está conectado.
- Si no se configura una entidad de potencia, se conserva el estado de carga del vehículo como referencia.
- No requiere cambiar las entidades ni la configuración existente.
- 33 pruebas automáticas superadas. Funcionamiento de la beta confirmado por el mantenedor en Home Assistant.
- Promoción de 1.2.2-beta.1 sin nuevos cambios funcionales.

## English

- When a real charging power entity is configured, positive power shows **Charging** and animates the cable even if the vehicle state is delayed.
- Fix the case where the charger is already supplying energy but the vehicle still reports Connected and the card displays Connected · Not charging.
- Zero power keeps the cable visible and stationary while the connector is connected.
- Unavailable power is explicitly displayed as **Connected · Power unavailable**, without animation, while the connector is connected.
- Without a configured power entity, vehicle charging state remains the fallback.
- No entity or existing configuration changes are required.
- 33 automated tests pass. Beta operation confirmed by the maintainer in Home Assistant.
- Promotes 1.2.2-beta.1 without additional functional changes.
