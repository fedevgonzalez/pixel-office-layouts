# Pixel Office Layouts

Community gallery of layouts for [Pixel Office](https://github.com/fedevgonzalez/pixel-office).

## How to use a layout

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

## Gallery

The [`gallery.json`](gallery.json) file at the repo root contains an auto-generated index of all layouts with metadata and layout stats. It is updated automatically when layouts are added or changed on the `main` branch.

| Name | Author | Description | Size | Furniture |
|------|--------|-------------|------|-----------|
| Default Office | fedevgonzalez | The default Pixel Office starter layout | 21x21 | 56 |

## License

All layouts in this repository are shared under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) -- free to use for any purpose, no attribution required.
