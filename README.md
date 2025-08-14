# Postman Collection to HTML Converter

A Node.js tool that converts Postman collection v2.1 into HTML document.

https://www.npmjs.com/package/postman-collection-to-html

## Features

- Convert Postman collection JSON files into HTML document
- Multi-language support (English and French)
- Custom logo embedding

## Installation

```bash
npm install -g postman-collection-to-html
```

## Usage

### Basic Usage

```bash
npx postman-collection-to-html my-collection.json
```

### Advanced Usage

```bash
# Specify output file
npx postman-collection-to-html my-collection.json --output=my-docs.html

# Specify language
npx postman-collection-to-html my-collection.json --lang=fr

# Include a logo
npx postman-collection-to-html my-collection.json --logo=path/to/logo.svg

# Add border-bottom to h1 headings
npx postman-collection-to-html my-collection.json --divider=h1

# All options together
npx postman-collection-to-html my-collection.json --output=docs.html --lang=fr --logo=assets/logo.svg --divider=h1
```

### Command Line Options

- `<input-file.json>`: Path to your Postman collection JSON file (required)
- `--output=filename.html`: Output HTML file name (optional, defaults to "api-doc.html")
- `--lang=language`: Language for the documentation (optional, defaults to "en")
- `--logo=logo.svg`: Path to SVG logo file to embed (optional)
- `--divider=h1|h2|h3|h4|h5|h6`: Heading level to add border-bottom styling (optional)

### Supported Languages

- **English** (`en`) - Default
- **French** (`fr`)

## Programmatic Usage

```javascript
import { collectionToHTML } from "postman-collection-to-html";
import fs from "fs";

// Generate English documentation (default)
collectionToHTML("collection.json");

// Generate with custom options
collectionToHTML("collection.json", {
  outputFile: "my-api-docs.html",
  language: "fr",
  divider: "h2",
});

// Generate documentation with a logo
const logo = fs.readFileSync("logo.svg", "utf8");
collectionToHTML("collection.json", {
  outputFile: "output.html",
  language: "en",
  logo: logo,
});
```

### Options

- `outputFile` (string, optional): Output HTML file name (defaults to "api-doc.html")
- `language` (string, optional): Language for the documentation (defaults to "en")
- `logo` (string, optional): SVG content to embed as logo (defaults to null)
- `divider` (string, optional): Heading level (h1-h6) to add border-bottom styling

## Logo Support

You can include a logo in the documentation header by passing SVG content as parameter to the `collectionToHTML` function. The logo content is embedded directly into the HTML, making the generated documentation completely self-contained.

### Adding a Logo (Programmatic)

```javascript
import { collectionToHTML } from "postman-collection-to-html";
import fs from "fs";

// Read SVG logo content
const logo = fs.readFileSync("path/to/your/logo.svg", "utf8");

// Generate documentation with logo
collectionToHTML("collection.json", {
  outputFile: "output.html",
  language: "en",
  logo: logo,
});
```

### Adding a Logo (Command Line)

```bash
# Specify logo file explicitly
npx postman-collection-to-html my-collection.json --logo=path/to/logo.svg
```

For command-line usage, use the `--logo` flag to specify the path to your SVG logo file.

### Logo Requirements

- **Format**: SVG format (required for inline embedding)
- **Size**: The logo will be automatically resized to:
  - **Desktop**: 80px height, max 350px width
  - **Mobile**: 60px height (responsive)
- **Self-contained**: The SVG content is embedded directly into the HTML, so no external files are needed

### Without Logo

If no logo is provided, the documentation will be generated without a logo, and the header will only contain the collection name and generation date.
