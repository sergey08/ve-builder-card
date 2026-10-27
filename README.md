![VE Builder Card](https://raw.githubusercontent.com/sergey08/ve-builder-card/main/assets/logo.png?logo=1.0.3)

# VE Builder Card

**English** · [Español](https://github.com/sergey08/ve-builder-card/blob/main/README.es.md)

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=sergey08&repository=ve-builder-card&category=plugin)

Create your own vehicle dashboard in Home Assistant. Combine vehicle information, charging controls, location, costs and a vehicle diagram using a visual editor. Works with the entities provided by your integrations; no manufacturer account is required by this card.

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

### Vehicle map

Assign each tyre pressure sensor and choose bar, kPa or psi. Optionally assign gear and opening sensors for the four doors, bonnet and boot. Configure the values that mean open and closed for your integration. Opening indicators appear only when a configured sensor confirms that the part is open; closed, unknown or unavailable states do not show an opening indicator. The diagram displays information; it does not operate doors or locks.

### Charging display

The cable remains visible and stationary while connected without energy flow. Set **Actual charging power** to distinguish charging from waiting: with a power entity, positive power determines charging and animation, even when the vehicle status is delayed. Zero power means waiting; unavailable power is identified explicitly. Without a power entity, the display follows the charging state. Reduced-motion preferences are respected.

### Images and languages

Use an image URL or a Home Assistant `/local/` image path in the Overview block. The interface supports **English and Spanish**, follows Home Assistant automatically, and also offers a language override in the editor. Your custom titles, field names and notes are preserved as entered.

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

---

<a id="espanol"></a>

![VE Builder Card](https://raw.githubusercontent.com/sergey08/ve-builder-card/main/assets/logo.png?logo=1.0.3)

# VE Builder Card

[English](https://github.com/sergey08/ve-builder-card/blob/main/README.md) · **Español**

[![Open in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=sergey08&repository=ve-builder-card&category=plugin)

Crea tu propio panel del vehículo en Home Assistant. Combina información del coche, controles de carga, ubicación, gastos y un esquema del vehículo desde un editor visual. Utiliza las entidades que ofrecen tus integraciones; la tarjeta no requiere una cuenta del fabricante.

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

### Mapa del vehículo

Asigna cada sensor de presión y elige bar, kPa o psi. Opcionalmente, añade la marcha y los sensores de apertura de las cuatro puertas, el capó y el maletero. Configura los valores que significan abierto y cerrado en tu integración. Los indicadores de apertura aparecen solo cuando el sensor configurado confirma que esa parte está abierta; los estados cerrado, desconocido o no disponible no muestran un indicador de apertura. El esquema muestra información; no acciona puertas ni cerraduras.

### Visualización de la carga

La manguera permanece visible y quieta cuando el coche está conectado sin recibir energía. Configura **Potencia real de carga** para distinguir la carga de la espera: si hay una entidad de potencia, su lectura positiva determina la carga y la animación, aunque el estado del vehículo llegue con retraso. Con potencia cero queda en espera y se indica expresamente si la potencia no está disponible. Sin entidad de potencia, sigue el estado de carga. Se respeta la preferencia de movimiento reducido.

### Imágenes e idiomas

Utiliza una URL de imagen o una ruta `/local/` de Home Assistant en el apartado Inicio. La interfaz admite **español e inglés**, sigue automáticamente el idioma de Home Assistant y permite elegirlo desde el editor. Los títulos, nombres de campos y comentarios personalizados se conservan tal como los escribas.

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
