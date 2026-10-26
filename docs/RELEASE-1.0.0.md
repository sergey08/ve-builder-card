# VE Builder Card 1.0.0

## English

First stable release. Same card behaviour as 1.0.0-rc.1, with additional acceptance tests.

- Visual block editor, starter templates, drag ordering, undo/redo and device entity filtering.
- English/Spanish interface and documentation.
- Vehicle images, charging cable/power, limits/actions, native map, costs and savings.
- Vehicle diagram with tyre pressures, gear and indicators shown only for confirmed open doors, bonnet and boot.

Validation: 22 automated tests pass. Five stored cards and 48 referenced entities validated against the maintainer’s Home Assistant. Mobile checks confirmed by the maintainer. Numbered RC installation through HACS verified. Automated rendering tests use a DOM stub; a separate visual desktop browser review was not performed. No vehicle commands or fake live states were used for testing.

Existing custom:ve-builder-card configurations remain compatible. Update through HACS and reload the browser. The older custom:vehicle-builder-card-v1 prototype is separate. This remains a HACS custom repository, outside the default catalogue.

## Español

Primera versión estable. Mismo comportamiento de tarjeta que 1.0.0-rc.1, con pruebas adicionales de aceptación.

- Editor visual por bloques, plantillas iniciales, arrastre, deshacer/rehacer y filtro de entidades por dispositivo.
- Interfaz y documentación en español e inglés.
- Imágenes, manguera/potencia de carga, límites/acciones, mapa nativo, gastos y ahorro.
- Dibujo del vehículo con presiones, marcha e indicadores solo para puertas, capó o maletero confirmados como abiertos.

Validación: 22 pruebas automáticas superadas. Cinco tarjetas guardadas y 48 entidades comprobadas contra el Home Assistant del mantenedor. Pruebas móviles confirmadas por el mantenedor. Instalación de la candidata numerada mediante HACS verificada. Las pruebas automáticas de renderizado usan un DOM simulado; no se realizó una revisión visual independiente en navegador de escritorio. No se enviaron órdenes al coche ni se falsearon estados reales para probar.

Las configuraciones custom:ve-builder-card existentes siguen siendo compatibles. Actualiza desde HACS y recarga el navegador. El prototipo custom:vehicle-builder-card-v1 continúa separado. Sigue siendo un repositorio personalizado de HACS, fuera del catálogo general.
