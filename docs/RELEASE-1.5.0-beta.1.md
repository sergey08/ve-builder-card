# VE Builder Card 1.5.0-beta.1

## English

- Export a whole card as a JSON backup, including its configured sections, appearance, alert settings, pressure advice and custom text.
- Optionally remove entity assignments to share a reusable layout. Titles, notes and image URLs remain: review these before sharing. No vehicle readings or image files are exported.
- Import a JSON file or paste JSON. Review the card title, section/field counts and unavailable entities before applying anything.
- Choose **Add sections only** to keep the existing card settings, or **Replace this card** to import the complete configuration. Both support undo/redo; Home Assistant Save is still required.
- Imported items receive new identifiers. Unsupported formats, malformed structures and files over 512 KB are rejected without modifying the current card.
- All new controls, help and errors are translated into English, Spanish, Portuguese, French, German, Italian and Dutch.

**Try it:** Edit → Export and import card. Export a configured card, import it into a temporary card, review the preview and test Add, Replace and Undo. Local image paths and entities must exist in the target Home Assistant installation. Import does not create entities or run vehicle commands.

This prerelease is developed on the beta/1.5.0 branch; main and stable 1.4.1 remain available separately. Mobile and native file-picker review are still needed.

## Español

- Exporta una tarjeta completa como copia JSON, incluidos apartados, aspecto, avisos, consejos de presión y textos personalizados.
- Permite quitar las asignaciones de entidades para compartir un diseño reutilizable. Se conservan títulos, notas y URL de imágenes: revísalos antes de compartir. No exporta lecturas del coche ni archivos de imagen.
- Importa un archivo JSON o pega el texto. Revisa el título, número de apartados y campos, y entidades no disponibles antes de aplicar cambios.
- Elige **Añadir solo los apartados** para conservar los ajustes actuales o **Reemplazar esta tarjeta** para importar toda la configuración. Ambas opciones admiten deshacer y rehacer; sigue siendo necesario Guardar en Home Assistant.
- Los elementos importados reciben identificadores nuevos. Rechaza formatos incompatibles, estructuras inválidas y archivos de más de 512 KB sin modificar la tarjeta actual.
- Controles, ayudas y errores nuevos en inglés, español, portugués, francés, alemán, italiano y neerlandés.

**Prueba:** Editar → Exportar e importar tarjeta. Exporta una tarjeta configurada, impórtala en una temporal, revisa la vista previa y prueba Añadir, Reemplazar y Deshacer. Las imágenes locales y entidades deben existir en la instalación de destino. La importación no crea entidades ni envía órdenes al vehículo.

Esta beta se desarrolla en la rama beta/1.5.0; main y la estable 1.4.1 siguen disponibles por separado. Queda pendiente la revisión móvil y del selector nativo de archivos.
