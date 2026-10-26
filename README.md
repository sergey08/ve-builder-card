![VE Builder Card](https://raw.githubusercontent.com/sergey08/ve-builder-card/main/assets/logo.png)

# VE Builder Card

**English** · [Español](README.es.md)

[![Open in HACS / Abrir en HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=sergey08&repository=ve-builder-card&category=plugin)

**Install with HACS:** click the button, confirm the custom repository and select Download. HACS must already be installed.

Build a fully configurable vehicle dashboard in Home Assistant: vehicle images, charging, costs and savings, location, and an interactive vehicle map showing tyre pressures, gear, open doors, bonnet and boot. Configure every block, entity, label and layout in the visual editor. **1.0.2 stable**. 22 automated tests pass; mobile checks confirmed by the maintainer.

The interface supports **English and Spanish**. It follows Home Assistant automatically, or you can choose a language in Edit. Custom titles, field names and notes remain exactly as you enter them.

## Install with HACS

1. Open HACS → Custom repositories.
2. Add `https://github.com/sergey08/ve-builder-card` with category **Dashboard**.
3. Find **VE Builder Card**, download the latest stable release, and reload Home Assistant.
4. If needed, add `/hacsfiles/ve-builder-card/ve-builder-card.js` as a JavaScript module resource.
5. Add **VE Builder Card** using the dashboard card picker.

[Open repository in HACS](https://my.home-assistant.io/redirect/hacs_repository/?owner=sergey08&repository=ve-builder-card&category=plugin)

This is a custom repository, outside the default HACS catalogue. Numbered releases are published automatically after validation. Release candidates are marked as prereleases. Installation of the numbered release candidate through HACS has been verified.

## Build your dashboard

Choose a title, add blocks, select entities, and customise each field’s name, icon, unit, decimal places, size, width and appearance. Save your changes. Each card is independent, with no preassigned sensors or manufacturer credentials.

| Block | Options |
| --- | --- |
| Overview | Vehicle image, information fields, connector, charging state and actual power |
| Information | Values, buttons and progress bars; size, style and width |
| Charging | Numeric fields and a power bar with its own scale |
| Charging modes | Switch and input_boolean controls |
| Limits | input_number sliders using the helper’s limits and step |
| Actions | Switches, locks and buttons with explicit tap actions |
| Map | person or device_tracker, zoom and history |
| Costs and savings | Reference prices, amount groups, units, decimal places and notes |
| Vehicle map | Four-wheel pressures (bar/kPa/psi), gear, four doors, bonnet and boot; indicators appear only when open |

The cable remains visible and still when connected without energy flow. Configure **Actual charging power** to distinguish charging from waiting. Animation requires the configured charging state and positive power; without a power entity it uses charging state alone. Reduced-motion preferences are respected.

## Manual installation

Copy `dist/ve-builder-card.js` to `/config/www/ve-builder-card.js` and add a module resource:

```yaml
url: /local/ve-builder-card.js?v=1.0.2
type: module
```

Add a card using the visual editor, or start with:

```yaml
type: custom:ve-builder-card
title: My vehicle
language: auto # auto, en or es
blocks:
  - id: information
    type: fields
    title: Status
    fields: []
```

Update the resource URL version after manual upgrades.

## Usage notes

- Unavailable readings show **No data**. They are never replaced with zero.
- Progress bars require a maximum greater than the minimum.
- Vehicle images use HTTP(S) URLs or Home Assistant local paths. No vehicle photograph is bundled.
- Pressure sensors must report bar, kPa or psi.
- Costs and savings come from your sensors. The card does not calculate or add savings.
- Maps require entity coordinates and use Home Assistant’s native map card.
- Sending a command does not confirm a vehicle action; the card waits for the integration’s state.

## Development and validation

Node.js 20 or later. No dependency download is needed:

```sh
npm run check
```

Source files live in `src/`; the build produces a self-contained `dist/ve-builder-card.js`. Automated tests cover data, conversions, configuration, actions, editor behaviour and languages. Home Assistant visual checks and mobile/desktop validation remain pending: [English checklist](docs/QA.en.md) · [Lista en español](docs/QA.md).

This card uses `custom:ve-builder-card` and per-block configuration. The earlier `custom:vehicle-builder-card-v1` prototype stays separate, without automatic migration.

The project logo uses a dark navy background with luminous cyan, blue and purple vehicle/dashboard symbols. It was generated for this project. Code and bundled artwork are provided under the [MIT licence](LICENSE).

## Starter templates

In Edit, expand Starter templates and choose Electric vehicle, Petrol / CNG, Costs and savings, or Tyres. Select your own entities afterwards. Templates append blocks and preserve existing configured blocks; only an empty starter is replaced. Drag the visible handles on blocks, fields and expense groups to reorder. Drop targets are highlighted. Keyboard: focus the heading and use Alt + Up/Down. Decimal precision for information and power fields is under Advanced options. Drag interaction still needs validation in Home Assistant.

## Editing helpers

Undo/Redo retains up to 50 changes during the current editing session. Reopening the editor resets history. Under each field’s Data section, optionally choose a device to filter available entities; the existing entity stays selected until you change it. Clear the filter to access helpers or entities from other devices. The filter is an editor convenience, not part of the saved card configuration.

## Vehicle map

The tyre block now also supports four doors, bonnet, boot and gear. In Edit, assign optional entities under Doors, bonnet and boot and Gear. For binary sensors use on/off; for covers use open/closed. Only confirmed open parts are highlighted. Closed, unavailable and unmatched states have no body overlay. Open doors swing outward and turn red. There are no status boxes below the diagram. Click a part for entity details. Gear is displayed as reported by the integration. Tyre sensors and conversion settings remain compatible.

## Stable 1.0

See [English / Spanish release notes](docs/RELEASE-1.0.2.md). 22 automated checks pass; mobile validation is confirmed. A separate visual desktop review was not performed. Select v1.0.2 in HACS.
