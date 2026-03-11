# Pixel Office Layouts

Community gallery of layouts for [Pixel Office](https://github.com/fedevgonzalez/pixel-office). Browse, star, and import layouts directly from the app.

## How to use a layout

The easiest way is through the app: click **Community** in Pixel Office to browse and import layouts with one click.

You can also do it manually:

1. Browse the [`layouts/`](layouts/) directory and pick one you like
2. Download the `layout.json` file from the layout's subdirectory
3. In Pixel Office, open **Settings** > **Import Layout**
4. Select the downloaded `.json` file

## Directory structure

Each layout lives in its own subdirectory:

```
layouts/
  default-office/
    layout.json       # The Pixel Office layout file
    metadata.json     # Name, author, description, tags
    preview.png       # Screenshot (optional)
```

## How to submit a layout

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full submission guide.

**Quick version:**

1. Fork this repo
2. Export your layout from Pixel Office (**Settings** > **Export Layout**)
3. Create a new directory under `layouts/` with your `layout.json`, `metadata.json`, and an optional `preview.png`
4. Run `node scripts/generate-gallery.js` to verify
5. Open a Pull Request

## Voting

Each layout has a corresponding GitHub Issue (labeled `layout-submission`). You can vote for layouts you like:

- **In the app:** Click the star icon on any layout in the Community gallery — this adds a +1 reaction to the layout's GitHub Issue.
- **On GitHub:** Find the layout's issue and add a :+1: reaction directly.

Vote counts are synced automatically every 6 hours and reflected in `gallery.json`.

## Gallery

See [`gallery.json`](gallery.json) for the full machine-readable index of all layouts with metadata, stats, and vote counts. It is regenerated automatically when layouts are added or votes change. Browse layouts directly in the Pixel Office app for the best experience.

## Contributing

This repo is public and welcomes contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide, or share your layout directly from the Pixel Office app.

## License

All layouts in this repository are shared under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) -- free to use for any purpose, no attribution required.
