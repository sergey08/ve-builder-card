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

---

# 1.4.0-beta.5 — Consejos compactos / Compact advice

## Español

- El cuadro de presión presenta perfil y temperatura exterior en una cabecera compacta que se adapta al ancho disponible.
- La explicación y el origen de la temperatura quedan dentro de «Más información», cerrado inicialmente. Conserva el estado desplegado al actualizar las lecturas.
- Los avisos distinguen gravedad: por ejemplo, «2 críticos · 2 en aviso». El detalle sigue mostrando las entidades afectadas, con los críticos primero.
- La advertencia de referencias de plena carga incompletas permanece visible.
- 50 pruebas automáticas superadas; pendiente de validación visual.

## English

- Pressure advice shows load profile and outside temperature in a compact header that wraps to available width.
- Explanation and temperature source move into «More information», initially collapsed. Expanded state is preserved when readings update.
- Summary distinguishes severity, for example «2 critical · 2 warnings». Details retain affected entities, with critical items first.
- Missing full load reference warnings remain visible.
- 50 automated tests pass; visual validation pending.

---

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

---

# 1.4.0-beta.3 — Contexto de temperatura / Temperature context

## Español

- Sustituye «Condición térmica desconocida» por «No se puede determinar si los neumáticos están fríos o calientes».
- Muestra la temperatura exterior utilizada y el nombre del sensor en el cuadro de consejos.
- Convierte Fahrenheit a Celsius para esta referencia. Si falta una lectura válida reciente, lo indica expresamente sin mostrar un valor antiguo como actual.
- Conserva perfiles, presiones de referencia, umbrales y resumen de avisos de las betas anteriores.
- 48 pruebas automáticas superadas; pendiente de validación visual.

## English

- Replaces the ambiguous thermal-condition message with «Cannot determine whether the tyres are cold or hot».
- Shows the outside temperature used and sensor name in the advice panel.
- Converts Fahrenheit to Celsius for this reference. Missing valid recent readings are explicitly identified without presenting old values as current.
- Preserves previous beta load profiles, reference pressures, thresholds and alert summary.
- 48 automated tests pass; visual validation pending.

---

# 1.4.0-beta.2 — Consejos de presión / Pressure advice

## Español

- Consejos opcionales en el mapa del vehículo, con referencia en frío y recordatorio de no desinflar neumáticos calientes.
- Perfiles de carga normal y plena carga con referencias por eje. Introduce exclusivamente los valores de la etiqueta del vehículo; no se inventan presiones ni se cambian por la estación del año.
- El perfil cambia la referencia visible; los umbrales de color y aviso se configuran por separado.
- Sensor opcional de temperatura exterior: admite °C y °F, rechaza lecturas de más de 30 minutos o demasiado futuras y muestra un consejo con 30 °C o más. No estima la temperatura del neumático.
- Sensor opcional con la fecha de fin del último trayecto: indica circulación reciente durante 2 horas. Sin evidencia suficiente muestra condición térmica desconocida, sin afirmar que las ruedas están frías.
- Actualización cada minuto sin reconstruir la tarjeta, suspendida con la página oculta.
- Disponible en Editar → Mapa del vehículo → Consejos y perfiles de presión. Desactivado por defecto.
- Incluye el resumen de avisos de beta.1. 47 pruebas automáticas superadas; pendiente de validación visual.

## English

- Optional vehicle diagram advice with cold pressure references and a reminder not to deflate hot tyres.
- Normal and full load profiles with per-axle references. Enter only vehicle label values; no invented pressures or seasonal automatic changes.
- The profile changes the displayed reference; colour and alert thresholds remain separately configurable.
- Optional outside temperature sensor: supports °C and °F, rejects readings older than 30 minutes or excessively future dates, and shows advice at 30 °C or above. Does not estimate tyre temperature.
- Optional last trip end timestamp sensor: indicates recent driving for 2 hours. Without sufficient evidence, shows unknown thermal condition rather than claiming cold tyres.
- Minute-based updates without rebuilding the card, paused while the page is hidden.
- Available in Edit → Vehicle diagram → Pressure advice and load profiles. Disabled by default.
- Includes the beta.1 alert summary. 47 automated tests pass; visual validation pending.

---

# 1.4.0-beta.1 — Resumen de avisos / Alert summary

## Español

- Resumen opcional y desplegable bajo el título, visible solo cuando hay avisos en la propia tarjeta.
- Reúne valores y presiones en aviso o crítico, aperturas confirmadas y lecturas antiguas. Utiliza las entidades y umbrales ya configurados, incluidos los límites por eje.
- Permite activar o excluir cada categoría desde Editar → Resumen de avisos. Desactivado por defecto.
- Prioriza los avisos críticos, evita duplicados y conserva el desplegable abierto al actualizar las lecturas.
- Pulsar un aviso abre los detalles de la entidad. No ejecuta órdenes ni envía notificaciones.
- Mantiene las actualizaciones de antigüedad cada minuto sin reconstruir la tarjeta.
- 43 pruebas automáticas superadas; beta pendiente de comprobación visual en móvil y escritorio.

## English

- Optional expandable summary below the title, shown only when this card has alerts.
- Collects warning or critical values and tyre pressures, confirmed openings and old readings. Uses existing entities and thresholds, including axle-specific pressure limits.
- Enable or exclude each category in Edit → Alert summary. Disabled by default.
- Prioritises critical alerts, avoids duplicates and preserves the expanded state when readings update.
- Tap an alert to open entity details. Does not run commands or send notifications.
- Keeps minute-based age updates without rebuilding the card.
- 43 automated tests pass; beta awaiting visual checks on mobile and desktop.

---

# 1.3.0 — Antigüedad de lecturas / Reading age

## Español

- Nuevo indicador opcional de antigüedad por apartado, con límite configurable en minutos (60 por defecto).
- Permite elegir un sensor cuyo valor sea la fecha real de lectura. Acepta fechas ISO y marcas Unix en segundos o milisegundos.
- Muestra Última lectura y marca Datos antiguos al alcanzar el límite. Atenúa los valores informativos sin bloquear controles ni cambiar la lógica de carga.
- Sin sensor de fecha, muestra el cambio más antiguo de las entidades del apartado, identificado expresamente: un valor estable puede seguir siendo válido.
- Las fechas ausentes, inválidas o demasiado futuras se muestran como no disponibles.
- Actualiza el indicador cada minuto sin reconstruir la tarjeta; evita actualizaciones de tiempo con la página oculta y limpia el temporizador al retirar la tarjeta.
- Disponible en Editar → apartado → Antigüedad de las lecturas. Desactivado por defecto en configuraciones existentes.
- 38 pruebas automáticas superadas. Indicador visual confirmado en la instalación del mantenedor.
- Promoción de 1.3.0-beta.1 sin nuevos cambios funcionales.

## English

- New optional per-block reading age indicator with a configurable age limit in minutes (default 60).
- Select a sensor whose value is the actual reading timestamp. Supports ISO dates and Unix seconds or milliseconds.
- Show Last reading and flag Old data at the threshold. Dim informational values without blocking controls or changing charging logic.
- Without a timestamp sensor, explicitly show the oldest entity state change: an unchanged value can still be valid.
- Missing, invalid or excessively future dates are shown as unavailable.
- Update labels every minute without rebuilding the card; avoid time updates while hidden and clean up the timer when removed.
- Available in Edit → block → Reading age. Disabled by default for existing configurations.
- 38 automated tests pass. Indicator visually confirmed in the maintainer's installation.
- Promotes 1.3.0-beta.1 without additional functional changes.

# 1.3.0-beta.1 — Antigüedad de lecturas / Reading age

## Español

- Aviso opcional de antigüedad por apartado, con tiempo configurable y sensor de fecha de lectura.
- Muestra la última lectura y marca Datos antiguos al superar el límite; atenúa valores informativos sin bloquear acciones ni alterar el estado de carga.
- Sin sensor de fecha, usa el cambio más antiguo de las entidades y lo identifica expresamente. Un estado estable no demuestra que el vehículo haya dejado de informar.
- Fechas ausentes, inválidas o demasiado futuras se identifican como no disponibles. Acepta fechas ISO y marcas Unix en segundos o milisegundos.
- El texto se actualiza cada minuto sin reconstruir la tarjeta; pausa las actualizaciones de tiempo con la página oculta y limpia el temporizador al retirar la tarjeta.
- Configuración existente intacta: función desactivada por defecto. 38 pruebas superadas; revisión visual pendiente.

## English

- Optional per-block reading age with a configurable age limit and reading timestamp sensor.
- Display last reading age and flag Old data at the threshold; dim informational values without blocking actions or changing charging status.
- Without a timestamp sensor, report the oldest entity state change explicitly. An unchanged state does not prove that reporting stopped.
- Missing, invalid or excessively future dates are unavailable. Supports ISO dates and Unix seconds or milliseconds.
- Update labels every minute without rebuilding the card; pause time updates when hidden and clean up the timer when removed.
- Existing configurations remain unchanged: disabled by default. 38 tests pass; visual validation pending.

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

# 1.2.1 — Corrección de colores / Colour fix

## Español

- Corrige la unión de las hojas de estilo que impedía ver los colores por valor y omitía los estilos del mapa del vehículo.
- Restaura verde, ámbar y rojo para los valores configurados, junto con los estilos de los indicadores de apertura.
- Conserva las referencias de presión recomendada en frío, los umbrales por eje y todas las configuraciones existentes. No hace falta volver a configurarlas.
- Añade una prueba de regresión que comprueba que las seis hojas de estilo llegan a la tarjeta distribuida.
- 32 pruebas automáticas superadas. Corrección confirmada por el mantenedor tras probar la beta en Home Assistant.
- Promoción de `1.2.1-beta.1` sin nuevos cambios funcionales.

## English

- Fix stylesheet composition that prevented value-based colours from appearing and omitted vehicle map styles.
- Restore green, amber and red for configured values, together with opening indicator styles.
- Preserve recommended cold pressure references, per-axle thresholds and all existing configuration. No reconfiguration is needed.
- Add a regression test ensuring all six stylesheets reach the distributed card.
- 32 automated tests pass. Fix confirmed by the maintainer after testing the beta in Home Assistant.
- Promotes `1.2.1-beta.1` without additional functional changes.

# 1.2.1-beta.1 — Corrección de estilos / Stylesheet fix

## Español

- Corrige una regresión al unir los estilos: una expresión con comas conservaba solo la última hoja y omitía los colores por valor y los estilos del mapa del vehículo.
- Restaura la aplicación de verde, ámbar y rojo y los estilos de aperturas, manteniendo las referencias de presión recomendada.
- Conserva todos los umbrales y configuraciones guardadas; no requiere volver a configurar los campos.
- Añade una prueba de regresión que exige que las seis hojas de estilo estén presentes en la tarjeta distribuida.
- 32 pruebas superadas. Pendiente validación visual tras instalar esta beta.

## English

- Fix a stylesheet composition regression: a comma expression retained only the last stylesheet and omitted value colours and vehicle map styles.
- Restore green, amber and red value colours and opening indicator styles while preserving recommended pressure references.
- Keep saved thresholds and configuration; fields do not need to be configured again.
- Add a regression test requiring all six stylesheets in the distributed card.
- 32 tests pass. Visual validation is pending installation of this beta.

# 1.2.0 — Colores por valor y presiones recomendadas / Value colours and recommended pressures

## Español

### Novedades

- **Colores según el valor** para campos numéricos, barras de potencia, precios e importes, límites y presiones del mapa del vehículo. Es opcional: las configuraciones existentes conservan su estilo hasta activarlo.
- Selección de avisos por **valores bajos o altos**, con umbral de aviso en ámbar y crítico en rojo; los valores fuera de los avisos se muestran en verde. Los umbrales incluyen el valor indicado y tienen prioridad los críticos.
- **Umbrales de presión independientes por eje**: delantero y trasero. Si no hay configuración propia, el eje utiliza los colores comunes; una configuración propia desactivada deja ese eje sin colorear.
- **Presión recomendada en frío**, en pequeño bajo cada rueda, con valores editables para delante y detrás. Se guarda en bar y se convierte a la unidad mostrada: bar, kPa o psi. Vacío o 0 oculta la referencia.
- Sin datos válidos o con umbrales incoherentes se conserva el estilo habitual, sin mostrar un estado verde engañoso.
- Guías en español e inglés y lista de mejoras pendientes en `docs/ROADMAP.md`.

### Configuración

En Editar, abre un campo numérico y **Colores según el valor**. En el Mapa del vehículo encontrarás los colores comunes, los ajustes por eje y **Presiones recomendadas**. Utiliza las presiones en frío de la etiqueta de tu vehículo; los umbrales visuales no son tolerancias oficiales ni presiones de inflado. No se incluyen valores de un modelo concreto por defecto.

### Validación

- 31 pruebas automáticas superadas: límites inclusivos, prioridad del crítico, datos ausentes, umbrales inválidos, conversión de unidades, ajustes por eje y referencias recomendadas.
- Validación de la beta final confirmada por el mantenedor en su instalación.
- Promoción de `1.2.0-beta.3` sin nuevos cambios funcionales.

## English

### What's new

- Optional **Value-based colours** for numeric fields, power bars, reference prices and amounts, limits and vehicle map pressures. Existing configurations retain their style until colours are enabled.
- Choose **low or high values**, with amber warning and red critical thresholds; values outside warning ranges appear green. Thresholds are inclusive and critical takes priority.
- **Independent front and rear axle pressure thresholds**. An axle without an override uses shared colours; a disabled axle override leaves it uncoloured.
- Small **recommended cold pressure** references beneath each wheel, with editable front and rear values. References are stored in bar and converted to the display unit: bar, kPa or psi. Empty or 0 hides the reference.
- Missing readings and invalid threshold order preserve the original style instead of showing a misleading green state.
- Updated English and Spanish guides and a pending improvements list in `docs/ROADMAP.md`.

### Configuration

In Edit, open a numeric field and **Value-based colours**. The Vehicle map contains shared colours, axle overrides and **Recommended pressures**. Use the cold pressures from your vehicle label; visual thresholds are not official tolerances or inflation pressures. No model-specific values are supplied by default.

### Validation

- 31 automated tests pass: inclusive boundaries, critical priority, missing data, invalid thresholds, unit conversion, axle overrides and recommended references.
- Final beta validated by the maintainer in their installation.
- Promotes `1.2.0-beta.3` without additional functional changes.

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
