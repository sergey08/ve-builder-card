# 1.0.3

## English

- Rewrite both guides to describe the current card, installation, templates and visual editor consistently.
- Document the Vehicle map: tyre pressures, gear, doors, bonnet and boot, with opening indicators shown only when confirmed open.
- Refresh the README logo URL to bypass previously cached failed image requests.
- Remove obsolete release numbers and contradictory validation statements.

## Español

- Revisión completa de ambas guías: tarjeta actual, instalación, plantillas y editor visual.
- Documentación del Mapa del vehículo: presiones, marcha, puertas, capó y maletero, con indicadores solo cuando se confirma la apertura.
- Nueva URL del logo del README para evitar reutilizar peticiones de imagen fallidas guardadas en caché.
- Eliminadas las versiones antiguas y las afirmaciones contradictorias sobre validación.

# Changelog / Historial

## 1.0.2

- Replace blank card-picker previews with a themed vehicle illustration and explicitly labelled sample readings. Hide the legacy prototype registration from the picker.
- Vista del selector con ilustración de vehículo y datos claramente marcados como ejemplo. Oculta la entrada del prototipo antiguo.

## 1.0.1

- Fix HACS logo rendering, expand vehicle-map description and update stable installation instructions.
- Corregido el logo en HACS, ampliada la descripción del mapa e instrucciones de instalación estable actualizadas.

## 1.0.0

- Stable release of the RC behaviour. 22 tests, stored configuration/entity validation and maintainer-confirmed mobile checks.
- Versión estable con el comportamiento de la candidata. 22 pruebas, validación de configuración/entidades y revisión móvil confirmada por el mantenedor.

## 1.0.0-rc.1

- First 1.0 release candidate; feature freeze. Bilingual release notes and automatic numbered prerelease publication. Manual acceptance checks remain pending.
- Primera candidata a 1.0; funciones congeladas. Notas bilingües y publicación automática de versiones numeradas. Comprobaciones manuales de aceptación pendientes.

## 0.1.0-beta.10

- Show vehicle body indicators only when open; remove the status boxes below the diagram.
- Indicadores de puertas, capó y maletero solo cuando están abiertos; eliminadas las cajas de estado bajo el dibujo.

## 0.1.0-beta.9

- Expand tyres into a vehicle map: four doors, bonnet, boot and gear. Configurable entities, labels and open/closed values; unknown states are never shown as closed. Existing tyre configurations remain supported.
- Neumáticos ampliado a mapa del vehículo: cuatro puertas, capó, maletero y marcha. Entidades, nombres y estados configurables; sin datos no equivale a cerrado. Compatibilidad con las configuraciones anteriores.

## 0.1.0-beta.8

- Add session-local undo/redo (50 edits) and an optional per-field device filter, without changing selected entities.
- Deshacer/rehacer durante la edición (50 cambios) y filtro opcional por dispositivo en cada campo, sin cambiar las entidades seleccionadas.

## 0.1.0-beta.7

- Drag fields, expense groups and blocks using visible handles and highlighted drop targets. Replace move buttons with Alt + arrow keyboard support.
- Arrastre de campos, grupos de gastos y bloques con asas visibles y destino resaltado. Sustituidos los botones Subir/Bajar por soporte de teclado Alt + flechas.

## 0.1.0-beta.6

- Add generic starter templates for electric vehicles, petrol/CNG, expenses and tyres. Configured blocks are preserved.
- Drag headings to reorder fields and blocks, with existing keyboard-friendly move buttons retained. Numeric precision moves to advanced options for information/power fields.
- Plantillas genéricas para eléctrico, gasolina/GNC, gastos y neumáticos; conservan los bloques configurados.
- Ordenación arrastrando títulos, manteniendo botones Subir/Bajar. Decimales en opciones avanzadas para información/potencia.

## 0.1.0-beta.5

- Restore charging panel layout: right-aligned current, surplus above the scale, compact units and separated energy/time rows.
- Recuperada la distribución del panel de carga: intensidad a la derecha, excedentes encima de la escala, unidades pequeñas y filas de energía/tiempo separadas.

## 0.1.0-beta.4

- Restore compact information pills, state-aware mode/action controls and a unified charging-power panel. All entities and labels remain editable.
- Recuperadas las etiquetas compactas, controles de modos/acciones con estado y un panel de potencia integrado. Entidades y nombres siguen siendo editables.

## 0.1.0-beta.3

- Fix compiled card rendering: preserve the escaping function reference. Add a runtime test of the distributed bundle.
- Corregido el renderizado de la tarjeta compilada: referencia correcta a la función de escape. Añadida una prueba de ejecución del archivo distribuido.

## 0.1.0-beta.2

English:
- Add project logo and English/Spanish documentation.
- Add automatic interface language and explicit English/Spanish selection.
- Localise built-in labels and numeric formatting while preserving custom text.
- Add language tests.

Español:
- Logo del proyecto y documentación en inglés y español.
- Idioma automático de interfaz y selección explícita inglés/español.
- Etiquetas y formato numérico traducidos conservando el texto personalizado.
- Pruebas de idiomas.

## 0.1.0-beta.1

Initial independent beta: configurable blocks, visual editor and HACS repository structure. Visual and clean-install validation pending.

Beta inicial independiente: bloques configurables, editor visual y estructura para HACS. Validación visual e instalación limpia pendientes.
