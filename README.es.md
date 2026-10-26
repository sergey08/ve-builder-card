# VE Builder Card

<p align="center"><img src="assets/logo.png" alt="VE Builder Card" width="240"></p>

[English](README.md) · **Español**

[![Open in HACS / Abrir en HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=sergey08&repository=ve-builder-card&category=plugin)

**Instalar con HACS:** pulsa el botón, confirma el repositorio personalizado y selecciona Descargar. Es necesario tener HACS instalado.

Tarjeta de Home Assistant para construir paneles de vehículos eléctricos mediante un editor visual por bloques. Versión **0.1.0-beta.2** de preparación. Pendiente de validación visual y de una instalación limpia de Home Assistant.

La interfaz admite **español e inglés**: sigue el idioma de Home Assistant o permite elegirlo en Editar → Idioma. Los nombres y comentarios personalizados no se traducen automáticamente.

## Primeros pasos

1. Instala `dist/ve-builder-card.js` como recurso de tipo módulo.
2. Recarga Home Assistant y busca **VE Builder Card** en **Añadir tarjeta**.
3. Elige un título y añade un bloque. Cada copia es independiente.
4. En cada campo selecciona la entidad y, si quieres, cambia nombre, icono, unidad y decimales.
5. Personaliza apariencia y comportamiento. Pulsa **Guardar**.

No hay sensores preasignados. Funciona con las entidades que proporcione tu integración: no se conecta directamente a ningún fabricante ni almacena credenciales.

## Bloques

| Bloque | Configuración |
| --- | --- |
| Inicio | Imagen por URL o `/local/`, altura, campos, conector, estado de carga y potencia real |
| Información | Valores, botones o barras; tamaño, estilo y anchura |
| Carga | Campos numéricos configurables, incluida barra de potencia con escala propia |
| Modos de carga | Controles `switch` e `input_boolean` |
| Límites | Deslizadores `input_number`, usando los límites y pasos del helper |
| Acciones | Interruptores, cerraduras y botones; detalles o acción explícita |
| Mapa | `person` o `device_tracker`, zoom e historial |
| Gastos y ahorro | Precios destacados, grupos de importes, unidades, decimales y comentario |
| Neumáticos | Dibujo con las cuatro posiciones, sensores, bar/kPa/psi, fechas y comentario |

La manguera permanece fija con el conector conectado y sin carga. Para distinguir carga de espera configura también **Potencia real**. Cuando la entidad de carga coincide con el estado configurado y la potencia es positiva, la animación se activa. Si no se configura potencia, se usa solo el estado de carga. Se respeta la preferencia del sistema de reducir animaciones.

## Instalación manual (disponible con este paquete)

Copia `dist/ve-builder-card.js` a `/config/www/ve-builder-card.js` y añade el recurso:

```yaml
url: /local/ve-builder-card.js?v=0.1.0-beta.2
type: module
```

Después añade una tarjeta manual o usa el selector visual:

```yaml
type: custom:ve-builder-card
title: Mi vehículo
blocks:
  - id: information
    type: fields
    title: Estado
    fields: []
```

El editor permite rellenar esta configuración sin escribir YAML. Cambia la versión de la URL cuando actualices manualmente.

## Instalación con HACS

1. Abre HACS → Repositorios personalizados.
2. Añade `https://github.com/sergey08/ve-builder-card` con categoría **Dashboard**.
3. Busca **VE Builder Card**, descarga la rama `main` y recarga Home Assistant.
4. Si el recurso no se registra automáticamente, añade `/hacsfiles/ve-builder-card/ve-builder-card.js` como módulo.
5. Añade la tarjeta desde el selector visual.

[Ver repositorio en HACS](https://my.home-assistant.io/redirect/hacs_repository/?owner=sergey08&repository=ve-builder-card&category=plugin)

La estructura está preparada para HACS; la primera instalación real sigue pendiente de validación. Esta beta se distribuye desde `main`. No forma parte del catálogo predeterminado de HACS y aún no tiene una release publicada.

## Notas de uso

- Los campos sin lectura muestran **Sin datos**, nunca un cero inventado.
- Las barras necesitan un máximo mayor que el mínimo.
- La imagen debe ser una URL HTTP(S) o una ruta local de Home Assistant. No se incluye ninguna fotografía de vehículo.
- Las presiones requieren que el sensor indique `bar`, `kPa` o `psi`.
- Gastos y ahorros se muestran desde los sensores; la tarjeta no calcula ni suma ahorros.
- El mapa requiere coordenadas en la entidad y usa la tarjeta nativa de Home Assistant.
- Una orden enviada no implica que el vehículo haya confirmado la acción. La tarjeta espera el estado de la integración.

## Desarrollo

Node.js 20 o posterior. La compilación no necesita descargar dependencias:

```sh
npm run check
```

El código se divide en `src/core.js`, `src/card.js`, `src/editor.js` y `src/styles.js`. El generador produce un único archivo autocontenido en `dist/`.

## Estado de validación

Hay pruebas automatizadas de datos, conversiones, configuración y acciones. La revisión visual con componentes reales de Home Assistant, HACS y la matriz móvil/escritorio siguen pendientes. Consulta [docs/QA.md](docs/QA.md).

Esta versión usa un formato nuevo con propiedades por bloque y el elemento `custom:ve-builder-card`. El prototipo `custom:vehicle-builder-card-v1` se mantiene separado. No hay migración automática: no reemplaces su tipo sin adaptar la configuración.

El logo del proyecto combina fondo azul oscuro y símbolos de vehículo y panel en cian, azul y violeta. Generado para este proyecto. Código y recursos bajo licencia MIT.
