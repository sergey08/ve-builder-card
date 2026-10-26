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

The cable remains visible and stationary while connected without energy flow. Set **Actual charging power** to distinguish charging from waiting: with a power entity, animation requires the charging state and positive power. Without one, it follows the charging state alone. Reduced-motion preferences are respected.

### Images and languages

Use an image URL or a Home Assistant `/local/` image path in the Overview block. The interface supports **English and Spanish**, follows Home Assistant automatically, and also offers a language override in the editor. Your custom titles, field names and notes are preserved as entered.

## Manual installation

Download `ve-builder-card.js` from the [latest release](https://github.com/sergey08/ve-builder-card/releases/latest), copy it to `/config/www/ve-builder-card.js`, then register `/local/ve-builder-card.js` as a JavaScript module. Use the card type `custom:ve-builder-card`.

## Updates and support

See the [release notes](https://github.com/sergey08/ve-builder-card/releases) for changes and [report an issue](https://github.com/sergey08/ve-builder-card/issues) with your Home Assistant version, card version and a configuration with private details removed. Installing from a custom repository does not mean the card is already in the general HACS catalogue.

For contributors, `npm run check` checks JavaScript syntax, runs the automated tests and builds the distributable. Installation through HACS and mobile operation have been confirmed in the maintainer’s installation. Automated tests do not replace visual checks across devices; see the [validation checklist](https://github.com/sergey08/ve-builder-card/blob/main/docs/QA.en.md).

MIT license.
