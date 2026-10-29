![VE Builder Card](https://raw.githubusercontent.com/sergey08/ve-builder-card/main/assets/logo.png?logo=1.0.3)

# VE Builder Card

**English** · [Español](https://github.com/sergey08/ve-builder-card/blob/main/README.es.md)

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=sergey08&repository=ve-builder-card&category=plugin)

Create your own vehicle dashboard in Home Assistant. Combine vehicle information, charging controls, location, costs and a vehicle diagram using a visual editor. Works with the entities provided by your integrations; no manufacturer account is required by this card.

The visual editor offers a compact language dropdown: Automatic (Home Assistant), English, Spanish, Portuguese, French, German, Italian and Dutch. Custom titles and field names remain as entered.

**Stable release: 1.7.0.** [Release changes](https://github.com/sergey08/ve-builder-card/releases/tag/v1.7.0).

## OTA firmware version in the vehicle header (1.7.1 beta)

In the **Overview with image** block, select an optional OTA version sensor (`ota_version_entity`) and update-status sensor (`ota_status_entity`). The card reads the `current_version` attribute (or a usable sensor state), displays the OS/version to the right of the vehicle title, and adds an amber alert icon only when an update is pending. Leave the version sensor blank to hide the indicator entirely. Example for XPeng Toolkit: `sensor.ota_update_xpeng_135818` and `sensor.ota_status_xpeng_135818`.

## See the card

A configurable vehicle dashboard with compact readings, a vehicle image and charging controls, plus a vehicle diagram with tyre pressures, confirmed openings, gear and expandable alerts.

| Vehicle overview and charging controls | Vehicle diagram, tyre pressures and alerts |
| --- | --- |
| ![Vehicle overview and charging controls](https://raw.githubusercontent.com/sergey08/ve-builder-card/main/assets/screenshots/vehicle-overview.png) | ![Vehicle diagram, tyre pressures and alerts](https://raw.githubusercontent.com/sergey08/ve-builder-card/main/assets/screenshots/vehicle-map.png) |

Real screenshots from the maintainer’s installation, captured during development. They illustrate the layout; readings, labels and features may differ from the current release. Entities, titles and images are configured by each user.

## Install with HACS

Click the button above, confirm the custom repository and download the latest stable release. HACS must already be installed. Alternatively, add `https://github.com/sergey08/ve-builder-card` in HACS → Custom repositories, with category **Dashboard**.

Reload the Home Assistant frontend after installing or updating. If HACS has not registered the resource, add `/hacsfiles/ve-builder-card/ve-builder-card.js` as a JavaScript module in Settings → Dashboards → Resources.

Add **VE Builder Card** from the card picker. The preview uses example values to illustrate the design; choose your own entities in the editor to display live data. A single official picker entry is registered; older local copies may need their old resource registration removed.

## Build your card

Set a title, add blocks and select entities. Rename blocks and fields, add or remove items, and drag fields or blocks to reorder them. Use the visual editor to choose field size, width, icons, units, decimal places and presentation as information, buttons or bars. Undo and redo are available during an editing session.

Start from an electric vehicle, combustion vehicle, costs or vehicle map template. Templates contain no preassigned sensors. Each card has its own configuration. The optional device filter helps find entities without changing their device assignments.

| Block | What you can configure |
| --- | --- |
| Overview | Vehicle image, compact information fields, connector, charging state and actual charging power |
| Information | Values, buttons and progress bars, with configurable size, width and appearance |
| Charging | Numeric fields and a power bar with its own scale |
| Charging modes | Switch and input_boolean controls |
| Limits | input_number sliders using the helper’s minimum, maximum and step |
| Actions | Switches, locks and buttons, with configurable tap actions |
| Location map | Native Home Assistant map using person or device_tracker entities, zoom and history |
| Costs and savings | Electricity and fuel reference prices, amount groups, units, precision and explanatory notes |
| Vehicle map | Four tyre pressures, gear, four doors, bonnet and boot on a vehicle diagram; pressure units, timestamps and notes |

### Pressure advice and load profiles

In **Edit → Vehicle map → Pressure advice and load profiles**, enable advice and choose normal or full load. Enter the cold pressures from the vehicle label for each axle. Changing the profile changes the displayed reference, not the colour thresholds. Full-load values are never invented.

Choose a fixed temperature sensor or **Temperature source → Based on location**. Configure the vehicle location entity, its home state (default `home`), a home outside sensor and a vehicle outside sensor for away. An unknown location or missing, old or invalid reading is shown explicitly; temperature is never borrowed from another location. Supports °C/°F and a configurable maximum age (default 30 minutes).

Profile and temperature stay compact; **More information** contains the sensor source and advice. An optional last-trip-end sensor (ISO/Unix) indicates recent driving for two hours. High outside temperature (30 °C or above) adds advice. Neither the season nor outside temperature automatically changes inflation targets or confirms that the tyres are cold. Check and adjust cold according to the vehicle label; do not deflate hot tyres.

### Alert summary

Enable **Edit → Alert summary** for an expandable list of warning and critical values, tyre pressures, confirmed openings and old readings. Each category can be disabled. Uses this card’s configured entities, axle thresholds and enabled reading-age settings. Hidden when there are no alerts. Selecting an item opens entity details without vehicle commands or notifications.

### Vehicle map

Assign each tyre pressure sensor and choose bar, kPa or psi. Optionally assign gear and opening sensors for the four doors, bonnet and boot. Configure the values that mean open and closed for your integration. Opening indicators appear only when a configured sensor confirms that the part is open; closed, unknown or unavailable states do not show an opening indicator. The diagram displays information; it does not operate doors or locks.

### Charging display

The cable remains visible and stationary while connected without energy flow. Set **Actual charging power** to distinguish charging from waiting: with a power entity, positive power determines charging and animation, even when the vehicle status is delayed. Zero power means waiting; unavailable power is identified explicitly. Without a power entity, the display follows the charging state. Reduced-motion preferences are respected.

### Rain over the vehicle

In **Edit → Overview → Rain over the vehicle**, enable the overlay and choose a current-weather entity, binary rain sensor or current precipitation sensor. Choose light, normal or heavy cosmetic intensity and animation. Unknown or old rain readings show no effect (maximum age: 180 minutes by default). Reduced-motion preferences produce a static effect.

For a home sensor, optionally restrict the effect to the vehicle’s home location. **Vehicle under cover** or a cover sensor can suppress rain in a garage. Use **Rain preview (sample data)** to test the appearance; it is labelled and ignores sensors/location/cover, so turn it off afterwards. No entities are preassigned. Current weather conditions are documented by [Home Assistant](https://www.home-assistant.io/integrations/weather/); forecasts and accumulated rain are not used to infer current rain.

### States below the vehicle

In **Edit → Overview → States below the vehicle**, add lock, door or window indicators. Select each entity and optionally customise its name, icon, normal/warning values and labels. Drag to reorder or remove unwanted indicators. Normal readings are subtle; openings and unlocked states are amber. Unknown readings show No data. Selecting an indicator opens details only and never operates a lock or window.

Defaults follow the entity domain: locked/unlocked for locks, closed/open for covers and off/on for binary sensors. For an aggregate door/window sensor, labels apply to that sensor’s meaning; individual sensors can have individual names. No entities are preassigned.

### Images and languages

Use an image URL or a Home Assistant `/local/` image path in the Overview block. The interface supports **English, Spanish, Portuguese, French, German, Italian and Dutch**, follows Home Assistant automatically, and also offers a language override in the editor. Your custom titles, field names and notes are preserved as entered.

## Manual installation

Download `ve-builder-card.js` from the [latest release](https://github.com/sergey08/ve-builder-card/releases/latest), copy it to `/config/www/ve-builder-card.js`, then register `/local/ve-builder-card.js` as a JavaScript module. Use the card type `custom:ve-builder-card`.

## Updates and support

See the [release notes](https://github.com/sergey08/ve-builder-card/releases) for changes and [report an issue](https://github.com/sergey08/ve-builder-card/issues) with your Home Assistant version, card version and a configuration with private details removed. Installing from a custom repository does not mean the card is already in the general HACS catalogue.

For contributors, `npm run check` checks JavaScript syntax, runs the automated tests and builds the distributable. Installation through HACS and mobile operation have been confirmed in the maintainer’s installation. Automated tests do not replace visual checks across devices; see the [validation checklist](https://github.com/sergey08/ve-builder-card/blob/main/docs/QA.en.md).

MIT license.

## Setup assistant

Open **Setup assistant** in the visual editor, choose the vehicle type and device, and select the sections to include. Click **Find entities**, review every suggestion, then **Add reviewed blocks**. Suggestions use Spanish and English entity names and compatible units. Ambiguous matches remain empty; assign or clear any entity before applying. Location is selected manually. Existing blocks are preserved, and Undo can reverse the addition. Suggestions do not send vehicle commands.

## Value-based colours

In a numeric field, expand **Value-based colours** and enable it. Select low or high values, then set warning and critical thresholds. Example battery: low, warning 40, critical 20 means green above 40%, amber from 20% to 40% (excluding 20%), red at or below 20%. Thresholds include the specified value. For tyres, configure colours in the Vehicle map block using its display unit. Missing data is not coloured. This feature is optional and does not change existing settings. [Planned improvements](https://github.com/sergey08/ve-builder-card/blob/main/docs/ROADMAP.md).

You can configure independent **front axle** and **rear axle** colours. Without an override, an axle uses shared colours; a disabled override leaves it uncoloured. Thresholds are visual alerts, not inflation pressures or official tolerances.

In **Recommended pressures**, enter cold front and rear pressures in bar. A small reference appears below each reading and converts to the display unit. Empty or 0 hides it. Use your vehicle label.

## Reading age

In Edit, open a block and **Reading age**. Enable the option and choose the age limit in minutes (default 60). You can select a sensor whose value is the actual reading timestamp, in ISO or Unix format. Without one, the oldest entity state change is shown explicitly: an unchanged value can remain valid. Old readings are dimmed without blocking controls; a sleeping vehicle is not a fault.

## Whole-card export and import

In **Edit → Export and import card**, download a JSON backup with entity assignments or uncheck **Include entities in export** to share a layout. Titles, notes and image URLs remain; review them before sharing. Vehicle readings and image files are not included.

Open a JSON file or paste its contents and select **Review import**. The preview shows sections, fields and unavailable entities. **Add sections only** preserves the current title and settings; **Replace this card** imports the full configuration. Undo/redo works, and you must still save the card. Imported items get independent identifiers. Imports do not create entities or send commands. File size limit: 512 KB. Local images and entities must be available on the destination system.

## Reuse sections

Select **Copy section** at the end of a block. In another card on the same page open **Edit → Reuse sections → Paste section**. Entities and appearance are preserved in an independent copy. Review entities and save. The temporary copy clears on page reload.

---

<a id="espanol"></a>

![VE Builder Card](https://raw.githubusercontent.com/sergey08/ve-builder-card/main/assets/logo.png?logo=1.0.3)

# VE Builder Card

[English](https://github.com/sergey08/ve-builder-card/blob/main/README.md) · **Español**

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=sergey08&repository=ve-builder-card&category=plugin)

Crea tu propio panel del vehículo en Home Assistant. Combina información del coche, controles de carga, ubicación, gastos y un esquema del vehículo desde un editor visual. Utiliza las entidades que ofrecen tus integraciones; la tarjeta no requiere una cuenta del fabricante.

El editor visual incluye un desplegable compacto de idioma: Automático (Home Assistant), inglés, español, portugués, francés, alemán, italiano y neerlandés. Los títulos y nombres personalizados se conservan tal como los escribas.

**Versión estable: 1.7.0.** [Cambios de esta versión](https://github.com/sergey08/ve-builder-card/releases/tag/v1.7.0).

## Así se ve la tarjeta

Un panel configurable con lecturas compactas, imagen del vehículo y controles de carga, más un mapa del coche con presiones, aperturas confirmadas, marcha y avisos desplegables.

| Resumen del vehículo y controles de carga | Mapa del vehículo, presiones y avisos |
| --- | --- |
| ![Resumen del vehículo y controles de carga](https://raw.githubusercontent.com/sergey08/ve-builder-card/main/assets/screenshots/vehicle-overview.png) | ![Mapa del vehículo, presiones y avisos](https://raw.githubusercontent.com/sergey08/ve-builder-card/main/assets/screenshots/vehicle-map.png) |

Capturas reales de la instalación del mantenedor, tomadas durante el desarrollo. Ilustran el diseño; los valores, textos y funciones pueden diferir de la versión actual. Cada usuario configura sus entidades, títulos e imágenes.

## Instalar con HACS

Pulsa el botón anterior, confirma el repositorio personalizado y descarga la última versión estable. HACS debe estar instalado. También puedes añadir `https://github.com/sergey08/ve-builder-card` en HACS → Repositorios personalizados, con la categoría **Panel de control** (Dashboard).

Recarga la interfaz de Home Assistant después de instalar o actualizar. Si HACS no ha registrado el recurso, añade `/hacsfiles/ve-builder-card/ve-builder-card.js` como módulo JavaScript en Ajustes → Paneles de control → Recursos.

Añade **VE Builder Card** desde el selector de tarjetas. La vista previa utiliza valores de ejemplo para mostrar el diseño; elige tus entidades en el editor para ver datos reales. Solo se registra una entrada oficial; las copias locales antiguas pueden requerir eliminar el registro de su recurso anterior.

## Diseña tu tarjeta

Pon un título, añade apartados y elige las entidades. Cambia los nombres de apartados y campos, añade o elimina elementos y arrastra campos o apartados para ordenarlos. El editor permite elegir tamaño, anchura, iconos, unidades, decimales y presentación como información, botones o barras. Puedes deshacer y rehacer durante la sesión de edición.

Empieza con una plantilla de vehículo eléctrico, vehículo de combustión, gastos o mapa del vehículo. Las plantillas no traen sensores preasignados. Cada tarjeta tiene su propia configuración. El filtro opcional por dispositivo facilita encontrar entidades sin cambiar su dispositivo asignado.

| Apartado | Qué puedes configurar |
| --- | --- |
| Inicio | Imagen del vehículo, campos compactos, conector, estado de carga y potencia real de carga |
| Información | Valores, botones y barras de progreso con tamaño, anchura y aspecto configurables |
| Carga | Campos numéricos y barra de potencia con escala propia |
| Modos de carga | Controles switch e input_boolean |
| Límites | Deslizadores input_number con el mínimo, máximo y paso del ayudante |
| Acciones | Interruptores, cerraduras y botones con acciones al pulsar |
| Mapa de ubicación | Mapa nativo de Home Assistant con entidades person o device_tracker, zoom e historial |
| Gastos y ahorro | Precios de referencia de electricidad y combustible, grupos de importes, unidades, decimales y comentarios |
| Mapa del vehículo | Presión de los cuatro neumáticos, marcha, cuatro puertas, capó y maletero sobre el esquema del coche; unidades de presión, fechas y comentarios |

### Consejos de presión y carga

Puedes seleccionar **Origen de la temperatura → Según la ubicación**. Configura la entidad de ubicación, su estado en casa (por defecto `home`), el sensor exterior de casa y el del vehículo para fuera. No utiliza temperatura de casa fuera de ella. Si la ubicación es desconocida o el sensor seleccionado no tiene lectura reciente válida, lo indica sin sustituirlo por el de otra ubicación. El modo sensor fijo sigue disponible.

El perfil y la temperatura se presentan de forma compacta; el origen del sensor y los consejos están en **Más información**. El resumen distingue avisos críticos y avisos de advertencia.

El cuadro de consejos muestra la temperatura exterior utilizada y el nombre del sensor; indica expresamente si falta una lectura válida reciente.

En **Editar → Mapa del vehículo → Consejos y perfiles de presión**, activa los consejos y elige carga normal o plena carga. Introduce las referencias por eje de la etiqueta del vehículo: el perfil no modifica los umbrales de aviso. Puedes seleccionar temperatura exterior (°C/°F, antigüedad máxima configurable: 30 minutos por defecto) y un sensor cuyo valor sea la fecha de fin del último trayecto (ISO/Unix). Se indica circulación reciente durante 2 horas y se muestra un consejo con 30 °C o más. Si falta contexto, se muestra condición térmica desconocida. No cambia presiones por ser verano ni confirma que las ruedas estén frías. [Consejos de Michelin](https://www.michelin.es/auto/consejos/presion-de-los-neumaticos/inflar-neumaticos).

### Resumen de avisos

Activa **Editar → Resumen de avisos** para mostrar una lista compacta y desplegable de valores y presiones en aviso o crítico, aperturas confirmadas y lecturas antiguas. Puedes desactivar cada categoría. Utiliza las entidades y umbrales de esta tarjeta, incluidos los límites de presión por eje y los ajustes de antigüedad activados. Desaparece cuando no hay avisos. Pulsa un elemento para ver sus detalles; no envía órdenes al vehículo ni notificaciones.

### Mapa del vehículo

Asigna cada sensor de presión y elige bar, kPa o psi. Opcionalmente, añade la marcha y los sensores de apertura de las cuatro puertas, el capó y el maletero. Configura los valores que significan abierto y cerrado en tu integración. Los indicadores de apertura aparecen solo cuando el sensor configurado confirma que esa parte está abierta; los estados cerrado, desconocido o no disponible no muestran un indicador de apertura. El esquema muestra información; no acciona puertas ni cerraduras.

### Visualización de la carga

La manguera permanece visible y quieta cuando el coche está conectado sin recibir energía. Configura **Potencia real de carga** para distinguir la carga de la espera: si hay una entidad de potencia, su lectura positiva determina la carga y la animación, aunque el estado del vehículo llegue con retraso. Con potencia cero queda en espera y se indica expresamente si la potencia no está disponible. Sin entidad de potencia, sigue el estado de carga. Se respeta la preferencia de movimiento reducido.

### Lluvia sobre el vehículo

En **Editar → Inicio → Lluvia sobre el vehículo**, activa la capa y selecciona una entidad meteorológica, sensor binario de lluvia o sensor de precipitación actual. Elige intensidad decorativa ligera, normal o intensa y animación. Sin datos recientes de lluvia no hay efecto (antigüedad máxima de 180 minutos por defecto). La preferencia de movimiento reducido deja el efecto estático.

Si usas un sensor de casa, puedes restringirlo a cuando el coche esté en casa. **Coche bajo techo** o un sensor de cobertura oculta la lluvia en el garaje. La **Vista previa de lluvia (datos de ejemplo)** permite probar el aspecto; lleva etiqueta e ignora sensores, ubicación y techo, por lo que debe desactivarse después. No trae entidades preasignadas. Se usan condiciones actuales según [Home Assistant](https://www.home-assistant.io/integrations/weather/), no previsiones ni lluvia acumulada.

### Estados bajo el vehículo

En **Editar → Inicio → Estados bajo el vehículo**, añade indicadores de cerradura, puertas o ventanillas. Selecciona cada entidad y personaliza opcionalmente nombre, icono, valores normal/de aviso y textos. Arrastra para ordenar o elimina los que no necesites. Estados normales discretos; aperturas y desbloqueado en ámbar. Lecturas desconocidas muestran Sin datos. Al pulsar solo abre detalles, nunca acciona cerraduras ni ventanas.

Valores por defecto según entidad: locked/unlocked para lock, closed/open para cover y off/on para sensores binarios. Si usas un sensor conjunto de puertas o ventanillas, las etiquetas corresponden al significado de ese sensor; los sensores individuales pueden llevar nombres propios. No hay entidades preasignadas.

### Imágenes e idiomas

Utiliza una URL de imagen o una ruta `/local/` de Home Assistant en el apartado Inicio. La interfaz admite **inglés, español, portugués, francés, alemán, italiano y neerlandés**, sigue automáticamente el idioma de Home Assistant y permite elegirlo desde el editor. Los títulos, nombres de campos y comentarios personalizados se conservan tal como los escribas.

## Instalación manual

Descarga `ve-builder-card.js` de la [última versión](https://github.com/sergey08/ve-builder-card/releases/latest), cópialo a `/config/www/ve-builder-card.js` y registra `/local/ve-builder-card.js` como módulo JavaScript. El tipo de tarjeta es `custom:ve-builder-card`.

## Actualizaciones y ayuda

Consulta los cambios en las [notas de versión](https://github.com/sergey08/ve-builder-card/releases) o [comunica un problema](https://github.com/sergey08/ve-builder-card/issues) indicando la versión de Home Assistant, la versión de la tarjeta y una configuración sin datos privados. La instalación como repositorio personalizado no implica que la tarjeta ya esté en el catálogo general de HACS.

Para contribuir, `npm run check` comprueba la sintaxis JavaScript, ejecuta las pruebas automáticas y genera el archivo distribuible. La instalación mediante HACS y el funcionamiento en móvil se han confirmado en la instalación del mantenedor. Las pruebas automáticas no sustituyen la revisión visual en distintos dispositivos; consulta la [lista de validación](https://github.com/sergey08/ve-builder-card/blob/main/docs/QA.md).

Licencia MIT.

## Asistente inicial

Abre **Asistente inicial** en el editor visual, elige el tipo de vehículo y el dispositivo, y marca los apartados que necesitas. Pulsa **Buscar entidades**, revisa cada sugerencia y selecciona **Añadir apartados revisados**. Las sugerencias usan nombres de entidad en español e inglés y unidades compatibles. Las coincidencias ambiguas quedan vacías; puedes asignar o quitar cualquier entidad antes de aplicar. La ubicación se elige manualmente. Se conservan los apartados existentes y puedes deshacer la incorporación. Las sugerencias no envían órdenes al coche.

## Colores según el valor

Dentro de un campo numérico, abre **Colores según el valor** y actívalo. Elige valores bajos o altos y los umbrales de aviso y crítico. Ejemplo de batería: bajo, aviso 40 y crítico 20 muestra verde por encima del 40%, ámbar entre el 20% y el 40% (sin incluir el 20%) y rojo al 20% o menos. Los umbrales incluyen el valor indicado. Para neumáticos, configura los colores en el Mapa del vehículo usando su unidad de presentación. Sin datos no se aplica color. Es opcional y no cambia la configuración existente. [Mejoras pendientes](https://github.com/sergey08/ve-builder-card/blob/main/docs/ROADMAP.md).

Puedes configurar colores independientes para **eje delantero** y **eje trasero**. Sin configuración propia, cada eje usa los colores comunes; si desactivas su configuración propia, ese eje queda sin colorear. Los umbrales son avisos visuales, no presiones de inflado ni tolerancias oficiales.

En **Presiones recomendadas**, introduce los valores en frío para delante y detrás, en bar. Aparecen en pequeño bajo cada lectura y se convierten si cambias la unidad mostrada. Vacío o 0 oculta la referencia. Usa la etiqueta de tu vehículo.

## Antigüedad de las lecturas

En Editar, abre un apartado y **Antigüedad de las lecturas**. Activa la opción y elige a partir de cuántos minutos considerar los datos antiguos (por defecto 60). Puedes seleccionar un sensor cuyo valor sea la fecha real de lectura, en ISO o Unix. Si no lo configuras, se muestra el cambio más antiguo de las entidades del apartado, identificado como tal: un valor estable puede seguir siendo válido. Los datos antiguos se atenúan sin bloquear controles; no significa que el coche esté averiado.

## Exportar e importar tarjetas completas

En **Editar → Exportar e importar tarjeta**, descarga una copia JSON con entidades o desmarca **Incluir entidades en la exportación** para compartir un diseño. Se conservan títulos, notas y URL de imágenes; revísalos antes de compartir. No incluye lecturas del vehículo ni archivos de imagen.

Abre un archivo JSON o pega su contenido y pulsa **Revisar importación**. La vista previa muestra apartados, campos y entidades no disponibles. **Añadir solo los apartados** conserva el título y los ajustes actuales; **Reemplazar esta tarjeta** importa la configuración completa. Admite deshacer y rehacer y debes Guardar la tarjeta. Los elementos importados reciben identificadores independientes. No crea entidades ni envía órdenes. Límite del archivo: 512 KB. Las imágenes locales y entidades deben existir en la instalación de destino.

## Reutilizar apartados

Pulsa **Copiar apartado** al final de un bloque. En otra tarjeta del mismo panel abre **Editar → Reutilizar apartados → Pegar apartado**. Conserva entidades y estilo en una copia independiente. Revisa entidades y guarda. La copia temporal desaparece al recargar la página.
