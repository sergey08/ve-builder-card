# 1.2.0-beta.3

## Español

- Referencia pequeña de presión recomendada en frío bajo cada lectura del mapa del vehículo.
- Configuración independiente delante/detrás en Editar → Presiones recomendadas.
- Se guardan las referencias en bar y se convierten a la unidad mostrada. Sin valor configurado no se muestra referencia.
- 31 pruebas superadas; validación visual pendiente.

## English

- Small recommended cold pressure reference beneath each vehicle map reading.
- Independent front/rear values in Edit → Recommended pressures.
- Store reference pressures in bar and convert to display units. No configured value means no reference is shown.
- 31 tests pass; visual validation pending.

# 1.2.0-beta.2

## Español

- Umbrales de color independientes para los ejes delantero y trasero del mapa del vehículo.
- Si un eje no tiene configuración propia, utiliza los colores comunes. Una configuración propia desactivada deja ese eje sin colorear.
- Se comparan presiones convertidas a la unidad mostrada. Los umbrales visuales son configurables, no tolerancias oficiales ni presiones de inflado.
- 30 pruebas automáticas superadas; revisión visual pendiente.

## English

- Independent front and rear axle colour thresholds for the vehicle map.
- Axles without their own configuration use shared colours. A disabled axle override leaves that axle uncoloured.
- Compare pressures after conversion to display units. Visual thresholds are configurable, not official tolerances or inflation pressures.
- 30 automated tests pass; visual review pending.

# 1.2.0-beta.1

## Español

- Colores opcionales por valor para campos numéricos, barras de carga, gastos, límites y presiones del mapa del vehículo.
- Configura dirección (valores bajos o altos), umbral de aviso (ámbar) y crítico (rojo). Normal: verde.
- Umbrales inclusivos, calculados en la unidad mostrada; las presiones se comparan tras la conversión.
- Sin datos, colores desactivados o umbrales incoherentes se conserva el estilo habitual.
- No modifica configuraciones existentes. 29 pruebas superadas; revisión visual pendiente.

## English

- Optional value-based colours for numeric fields, charging bars, costs, limits and vehicle map pressures.
- Configure low/high direction, warning (amber) and critical (red) thresholds. Normal: green.
- Inclusive thresholds use displayed units; pressures are compared after conversion.
- Missing data, disabled colours or invalid thresholds preserve the original style.
- Existing configurations are unchanged. 29 tests pass; visual review pending.

# 1.1.1

## Español

- Mejora de rendimiento: evita reconstrucciones de la vista previa por cambios ajenos a la tarjeta y reduce el trabajo de actualización y validación del editor.
- Se mantienen las funciones de la beta 1.1.1-beta.1 sin nuevos cambios funcionales.
- 26 pruebas automáticas superadas. Mejora de fluidez confirmada por el mantenedor en móvil.

## English

- Performance improvements: avoid preview rebuilds for unrelated changes and reduce update and editor validation work.
- Promotes 1.1.1-beta.1 without additional functional changes.
- 26 automated tests pass. Improved responsiveness confirmed by the maintainer on mobile.

# 1.1.1-beta.1

## Español

- Evita reconstruir la vista de ejemplo cuando cambian entidades ajenas a la tarjeta.
- Compara referencias de los estados usados en lugar de serializar sus atributos completos.
- Evita buscar mapas y repetir validaciones del editor cuando no hay cambios relevantes.
- 26 pruebas automáticas superadas. Pendiente comprobar fluidez en un móvil real; versión preliminar.

## English

- Avoid rebuilding the sample preview when unrelated entities change.
- Compare relevant state references instead of serialising complete attributes.
- Avoid repeated map lookups and editor validation when relevant data is unchanged.
- 26 automated tests pass. Real mobile responsiveness remains to be checked; prerelease.

# 1.1.0

## Español

- Nuevo Asistente inicial en el editor visual: tipo de vehículo, dispositivo y apartados de carga, mapa del vehículo y ubicación.
- Sugerencias limitadas al dispositivo elegido y a entidades activas; las coincidencias ambiguas quedan sin asignar.
- Revisión y cambio de entidades antes de añadir los apartados. Se conserva la configuración existente y se puede deshacer.
- Respeta las unidades del sensor; ajusta la escala inicial de potencia para W o kW.
- Las sugerencias utilizan nombres en español o inglés y son orientativas. Las entidades no reconocidas se eligen manualmente.

## English

- New visual Setup assistant: vehicle type, device and charging, vehicle map and location sections.
- Suggestions are restricted to the selected device and enabled entities; ambiguous matches remain unassigned.
- Review and change entities before adding blocks. Existing configuration is preserved and the operation can be undone.
- Preserve sensor units and choose an initial power scale for W or kW.
- Suggestions use Spanish or English names and are advisory. Unrecognised entities can be selected manually.

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
