# VE Builder Card 1.7.3-beta.1

## English

Standard saved labels now follow the selected card language in English, Spanish, Portuguese, French, German, Italian and Dutch, including block headings, charging modes, actions, limits, costs and period labels. Matching is exact; custom labels and sensor friendly names are preserved. Disable **Translate standard labels** in the visual editor (`translate_standard_labels: false`) to display saved text literally. Language remains a per-card setting; **Automatic** follows Home Assistant. Existing configuration is not rewritten.

Beta for validation before a stable release. Automated tests cover all seven languages, reverse translation of saved standard labels, literal-text mode and configuration preservation.

## Español

Los nombres estándar guardados siguen ahora el idioma de la tarjeta en inglés, español, portugués, francés, alemán, italiano y neerlandés: títulos de bloques, modos de carga, acciones, límites, costes y periodos. Solo se reconocen coincidencias completas; se conservan los textos personalizados y los nombres propios de los sensores. Desactiva **Traducir nombres estándar** en el editor (`translate_standard_labels: false`) para mostrar literalmente el texto guardado. El idioma se configura por tarjeta; **Automático** sigue Home Assistant. No se reescribe la configuración existente.

Beta para validar antes de publicar la estable. Las pruebas automáticas cubren los siete idiomas, la traducción de nombres estándar guardados en otros idiomas, el modo literal y la conservación de la configuración.
