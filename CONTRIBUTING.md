# Contributing Layouts

Thanks for sharing your Pixel Office layout with the community!

## Submission Guide

### 1. Export your layout

In Pixel Office, open **Settings** > **Export Layout** and save the `.json` file.

### 2. Fork and clone this repo

```sh
git clone https://github.com/<your-username>/pixel-office-layouts.git
cd pixel-office-layouts
```

### 3. Create your layout directory

Each layout lives in its own subdirectory under `layouts/`:

```
layouts/
  your-layout-name/
    layout.json        # Your exported layout file
    metadata.json      # Layout metadata (see below)
    preview.png        # Screenshot of your layout (optional but recommended)
```

Use lowercase kebab-case for the directory name. Keep it short and descriptive (e.g. `cozy-startup`, `big-open-plan`, `cyberpunk-hq`).

### 4. Create metadata.json

```json
{
  "name": "Your Layout Name",
  "author": "your-github-username",
  "description": "A short description of your layout",
  "tags": ["tag1", "tag2"],
  "createdAt": "YYYY-MM-DD"
}
```

**Fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Display name for your layout |
| `author` | Yes | Your GitHub username |
| `description` | Yes | Brief description (1-2 sentences) |
| `tags` | Yes | Array of lowercase tags for categorization |
| `createdAt` | Yes | Date in `YYYY-MM-DD` format |

### 5. Add a preview screenshot

Take a screenshot of your layout in Pixel Office and save it as `preview.png` in your layout directory. This helps others see what your layout looks like before importing it.

### 6. Test locally

Run the gallery generator to make sure your entry is valid:

```sh
node scripts/generate-gallery.js
```

Check that `gallery.json` includes your layout with the correct information.

### 7. Open a Pull Request

Push your branch and open a PR. The gallery will be automatically regenerated when your PR is merged.

## Directory Structure

```
layouts/
  your-layout-name/
    layout.json       # Pixel Office layout (version 1 format)
    metadata.json     # Name, author, description, tags, date
    preview.png       # Screenshot (optional)
```

## Guidelines

- One layout per directory
- Layout files must be valid Pixel Office exports (`version: 1` with `tiles` and `furniture` arrays)
- Keep descriptions concise
- Use relevant tags to help others find your layout
- Preview screenshots should show the full layout

## License

By submitting a layout, you agree to release it under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) -- free to use for any purpose, no attribution required.
