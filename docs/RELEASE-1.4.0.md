# VE Builder Card 1.4.0

## Español

Esta versión estable reúne las mejoras validadas durante las betas 1.4.0 y conserva las configuraciones existentes.

- **Siete idiomas**: inglés, español, portugués, francés, alemán, italiano y neerlandés. Un desplegable compacto permite elegir idioma o seguir Home Assistant automáticamente. Se traducen el editor, sus menús, opciones, botones, ayudas y avisos, además de la tarjeta. Los títulos, nombres y notas personalizados se conservan.
- **Resumen de avisos opcional**: valores y presiones en aviso o crítico, aperturas confirmadas y lecturas antiguas. Distingue niveles de gravedad, permite elegir categorías y abre los detalles de la entidad sin enviar órdenes ni notificaciones.
- **Consejos y perfiles de presión**: referencias en frío para carga normal o plena carga, configuradas según la etiqueta del vehículo. El perfil cambia la referencia, no los umbrales de color.
- **Temperatura según ubicación**: sensor exterior de casa cuando el vehículo está en casa y sensor exterior del vehículo cuando está fuera, o un sensor fijo. Admite °C/°F y antigüedad máxima configurable. Indica datos desconocidos o no válidos sin recurrir al sensor de otra ubicación.
- **Consejos compactos**: perfil y temperatura visibles; origen del sensor y explicaciones en Más información. No cambia presiones por la estación ni presupone neumáticos fríos. Puede indicar circulación reciente con un sensor de fin de trayecto.
- **Fechas más claras**: la actualización general del vehículo se distingue del último cambio de cada neumático.
- **Copiar apartados entre tarjetas**: conserva entidades y estilo en una copia independiente, con identificadores nuevos y compatibilidad con deshacer y rehacer. La copia temporal se borra al recargar la página.
- **Documentación renovada**: capturas reales del panel y mapa del vehículo, instrucciones completas en español e inglés y descripción actualizada de los bloques.

**Validación:** 58 pruebas automáticas correctas; beta instalada y validada por el mantenedor. Las traducciones nuevas admiten mejoras de hablantes nativos.

**Actualizar:** descarga 1.4.0 desde HACS y recarga la interfaz de Home Assistant. La publicación no modifica tus entidades ni la configuración de tus tarjetas. Los consejos no sustituyen las presiones indicadas en la etiqueta del vehículo.

## English

This stable release brings together the improvements validated during the 1.4.0 betas and preserves existing configurations.

- **Seven languages**: English, Spanish, Portuguese, French, German, Italian and Dutch. A compact dropdown selects a language or follows Home Assistant automatically. Translates the editor, menus, options, buttons, help and alerts, as well as the card. Custom titles, names and notes are preserved.
- **Optional alert summary**: warning and critical values and tyre pressures, confirmed openings and old readings. Separates severity levels, supports category selection and opens entity details without vehicle commands or notifications.
- **Pressure advice and load profiles**: cold references for normal and full load, entered from the vehicle label. Profiles change references, not colour thresholds.
- **Location-based temperature**: home outside sensor while at home and vehicle outside sensor while away, or a fixed sensor. Supports °C/°F and a configurable maximum age. Unknown or invalid data remains explicit without substituting a sensor from another location.
- **Compact advice**: visible profile and temperature, with source and explanations under More information. Seasons do not change pressure targets and cold tyres are never assumed. An optional trip-end sensor can indicate recent driving.
- **Clearer timestamps**: distinguishes the overall vehicle update from each tyre’s last state change.
- **Copy sections between cards**: preserves entities and appearance in an independent copy with new identifiers and undo/redo support. The temporary copy clears on page reload.
- **Updated documentation**: real dashboard and vehicle-map screenshots, complete Spanish and English instructions and updated block descriptions.

**Validation:** 58 automated tests pass; the installed beta was validated by the maintainer. Native-speaker improvements to the new translations are welcome.

**Update:** download 1.4.0 in HACS and reload the Home Assistant frontend. Publishing does not change your entities or card configuration. Advice does not replace the pressures on the vehicle label.
