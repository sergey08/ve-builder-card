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

### Consejos de presión y carga

Desde **1.4.0-beta.6**, puedes seleccionar **Origen de la temperatura → Según la ubicación**. Configura la entidad de ubicación, su estado en casa (por defecto `home`), el sensor exterior de casa y el del vehículo para fuera. No utiliza temperatura de casa fuera de ella. Si la ubicación es desconocida o el sensor seleccionado no tiene lectura reciente válida, lo indica sin sustituirlo por el de otra ubicación. El modo sensor fijo sigue disponible.

Desde **1.4.0-beta.5**, perfil y temperatura se presentan de forma compacta; el origen del sensor y los consejos están en **Más información**. El resumen distingue avisos críticos y normales.

El cuadro de consejos muestra la temperatura exterior utilizada y el nombre del sensor; indica expresamente si falta una lectura válida reciente. Disponible en **1.4.0-beta.3**.

En **Editar → Mapa del vehículo → Consejos y perfiles de presión**, activa los consejos y elige carga normal o plena carga. Introduce las referencias por eje de la etiqueta del vehículo: el perfil no modifica los umbrales de aviso. Puedes seleccionar temperatura exterior (°C/°F, lectura de menos de 30 minutos) y un sensor cuyo valor sea la fecha de fin del último trayecto (ISO/Unix). Se indica circulación reciente durante 2 horas y se muestra un consejo con 30 °C o más. Si falta contexto, se muestra condición térmica desconocida. No cambia presiones por ser verano ni confirma que las ruedas estén frías. Disponible en **1.4.0-beta.2**. [Consejos de Michelin](https://www.michelin.es/auto/consejos/presion-de-los-neumaticos/inflar-neumaticos).

### Resumen de avisos

Activa **Editar → Resumen de avisos** para mostrar una lista compacta y desplegable de valores y presiones en aviso o crítico, aperturas confirmadas y lecturas antiguas. Puedes desactivar cada categoría. Utiliza las entidades y umbrales de esta tarjeta, incluidos los límites de presión por eje y los ajustes de antigüedad activados. Desaparece cuando no hay avisos. Pulsa un elemento para ver sus detalles; no envía órdenes al vehículo ni notificaciones. Disponible en **1.4.0-beta.1** para pruebas.

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

## Antigüedad de las lecturas

En Editar, abre un apartado y **Antigüedad de las lecturas**. Activa la opción y elige a partir de cuántos minutos considerar los datos antiguos (por defecto 60). Puedes seleccionar un sensor cuyo valor sea la fecha real de lectura, en ISO o Unix. Si no lo configuras, se muestra el cambio más antiguo de las entidades del apartado, identificado como tal: un valor estable puede seguir siendo válido. Los datos antiguos se atenúan sin bloquear controles; no significa que el coche esté averiado.
