# VE Builder Card 1.5.0

## English

Export and import complete vehicle cards from the visual editor.

- Download a JSON backup with entity assignments, or remove those assignments to share a reusable layout.
- Open a JSON file or paste JSON and review its title, sections, fields and unavailable entities before applying it.
- Add sections while retaining the current card settings, or replace the whole card. Both support undo and redo; Save in Home Assistant remains required.
- Keep custom text, appearance, alert thresholds and pressure-advice settings. Imported items receive independent identifiers.
- Reject unsupported or malformed imports and files over 512 KB without modifying the current card.
- New controls, help and errors are available in English, Spanish, Portuguese, French, German, Italian and Dutch.

Files contain configuration, not live readings or image files. Titles, notes and image URLs remain even when entity assignments are removed: review them before sharing. Referenced entities and local image paths must exist on the destination system. Importing creates no sensors and sends no vehicle commands.

**Validation:** 64 automated tests pass. Round-trip and entity-free export were additionally verified against all four existing maintainer cards: XPeng G6, Costs and savings, Vehicle map and Seat Ibiza. Native file-picker and mobile visual review are release-gate items recorded in the release pull request.

**Use:** Edit → Export and import card. Reload the frontend after downloading through HACS. Existing cards need no migration.

## Español

Exportación e importación de tarjetas completas desde el editor visual.

- Descarga una copia JSON con asignaciones de entidades o quítalas para compartir un diseño reutilizable.
- Abre un archivo JSON o pega el texto y revisa título, apartados, campos y entidades no disponibles antes de aplicar.
- Añade apartados conservando los ajustes actuales o reemplaza toda la tarjeta. Ambas opciones admiten deshacer y rehacer; sigue siendo necesario Guardar en Home Assistant.
- Conserva textos personalizados, aspecto, umbrales de avisos y consejos de presión. Los elementos importados reciben identificadores independientes.
- Rechaza importaciones incompatibles o inválidas y archivos de más de 512 KB sin modificar la tarjeta actual.
- Controles, ayudas y errores nuevos en inglés, español, portugués, francés, alemán, italiano y neerlandés.

Los archivos contienen configuración, no lecturas ni imágenes adjuntas. Títulos, notas y URL de imágenes se conservan incluso al quitar entidades: revísalos antes de compartir. Las entidades y rutas locales deben existir en el destino. Importar no crea sensores ni envía órdenes al vehículo.

**Validación:** 64 pruebas automáticas correctas. Además, se ha comprobado la exportación e importación completa y sin entidades de las cuatro tarjetas existentes: XPeng G6, Gastos y ahorro, Mapa del vehículo y Seat Ibiza. La prueba visual móvil y del selector de archivos queda como requisito pendiente en el PR de publicación.

**Uso:** Editar → Exportar e importar tarjeta. Recarga la interfaz después de descargar desde HACS. Las tarjetas existentes no requieren migración.
