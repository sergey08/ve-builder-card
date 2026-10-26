# Validation checklist

**English** · [Español](QA.md)

Automated checks: run `npm run check`. The following checks require a real Home Assistant installation and are pending.

- Install through HACS as a custom Dashboard repository and verify resource registration.
- Add the card from the picker and save an empty configuration.
- Add, rename, duplicate, reorder and remove every block type.
- Change entity selectors and options without the editor closing or losing focus.
- Verify image URL/local paths, sizes and responsive layout on mobile and desktop.
- Verify cable hidden when disconnected, stationary when connected without power, animated only while charging.
- Check values, buttons, bars, minimum/maximum, precision, units and missing data.
- Exercise switches, locks, buttons, confirmation dialogs and helper sliders.
- Check native maps with person/device_tracker coordinates.
- Verify reference-price styling, amount groups and footer notes.
- Check four tyre positions, conversions, timestamps and notes.
- Verify automatic language and English/Spanish overrides; preserve custom names and notes.
- Check keyboard access, reduced motion, themes and multiple independent cards.
