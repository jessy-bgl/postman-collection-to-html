const fs = require("fs");
const showdown = require("showdown");
const { argv } = require("node:process");

// Parse and validate command-line arguments
if (argv.length < 3 || argv.length > 4) {
  console.error("Error: 1 or 2 arguments required.");
  console.error("Usage: node index.js <input-file.json> [output-file.html]");
  console.error(
    "If output file is not provided, 'api-doc.html' will be used by default."
  );
  process.exit(1);
}

// Extract arguments
const inputFile = argv[2];
// Use default value "api-doc.html" if outputFile is not provided
const outputFile = argv.length === 4 ? argv[3] : "api-doc.html";

// Validate input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file '${inputFile}' does not exist.`);
  process.exit(1);
}

// Validate input file is a string
if (typeof inputFile !== "string") {
  console.error("Error: Input file must be a string.");
  process.exit(1);
}

// Validate output file is a string
if (typeof outputFile !== "string") {
  console.error("Error: Output file must be a string.");
  process.exit(1);
}

// Validate input file is JSON by trying to parse it
try {
  // Just check if it's parseable - will be fully parsed later
  JSON.parse(fs.readFileSync(inputFile, "utf8"));
} catch (error) {
  console.error(
    `Error: Input file '${inputFile}' is not valid JSON:`,
    error.message
  );
  process.exit(1);
}

const converter = new showdown.Converter({
  backslashEscapesHTMLTags: false,
  completeHTMLDocument: false,
  customizedHeaderId: false,
  disableForced4SpacesIndentedSublists: false,
  ellipsis: true,
  emoji: false,
  encodeEmails: false,
  ghCodeBlocks: true,
  ghCompatibleHeaderId: false,
  ghMentions: false,
  headerLevelStart: 1,
  literalMidWordUnderscores: true,
  metadata: false,
  noHeaderId: false,
  omitExtraWLInCodeBlocks: true,
  openLinksInNewWindow: true,
  parseImgDimensions: false,
  prefixHeaderId: false,
  rawHeaderId: false,
  rawPrefixHeaderId: false,
  requireSpaceBeforeHeadingText: false,
  simpleLineBreaks: false,
  simplifiedAutoLink: true,
  smartIndentationFix: true,
  smoothLivePreview: false,
  splitAdjacentBlockquotes: false,
  strikethrough: true,
  tables: true,
  tablesHeaderId: false,
  tasklists: true,
  underline: false,
});

// Read the Postman collection file
try {
  const postmanCollection = JSON.parse(fs.readFileSync(inputFile, "utf8"));
  generateHtmlDocumentation(postmanCollection);
} catch (error) {
  console.error("Error reading or parsing the Postman collection:", error);
  process.exit(1);
}

function generateHtmlDocumentation(collection) {
  // Extract the collection info
  const { info, item: folders } = collection;

  // Get current date for generation timestamp
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(
    today.getMonth() + 1
  ).padStart(2, "0")}/${today.getFullYear()}`;

  // Start building the HTML content
  let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${info.name} - API Documentation</title>
    <style>
        :root {
            --primary-color: #4a6ee0;
            --secondary-color: #6c757d;
            --light-bg: #f8f9fa;
            --dark-bg: #343a40;
            --border-color: #dee2e6;
            --success-color: #28a745;
            --warning-color: #ffc107;
            --danger-color: #dc3545;
            --info-color: #17a2b8;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            margin-bottom: 30px;
            padding-bottom: 20px;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .header-text {
            flex: 1;
            min-width: 0;
        }
        
        .header-logo {
            flex-shrink: 0;
        }
        
        .logo {
            height: 80px;
            width: auto;
            max-width: 350px;
        }
        
        .generation-date {
            color: var(--secondary-color);
            font-size: 1rem;
            margin-top: 5px;
        }
        
        h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5rem;
            margin-bottom: 1rem;
        }

        h2 {
            border-bottom: 1px solid var(--border-color);
        }
  
        p {
            margin-bottom: 1rem;
        }
        
        a {
            color: var(--primary-color);
            text-decoration: none;
        }
        
        a:hover {
            text-decoration: underline;
        }
        
        pre {
            background-color: var(--light-bg);
            border: 1px solid var(--border-color);
            border-radius: 5px;
            padding: 15px;
            overflow-x: auto;
            margin: 1rem 0;
        }
        
        code {
            font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
            font-size: 0.9em;
            padding: 0.2em 0.4em;
            background-color: var(--light-bg);
            border-radius: 3px;
        }
        
        .container {
            display: flex;
            flex-wrap: wrap;
            gap: 30px;
        }
        
        .sidebar {
            flex: 0 0 300px;
            position: sticky;
            top: 20px;
            max-height: calc(100vh - 40px);
            overflow-y: auto;
        }
        
        .content {
            flex: 1;
            min-width: 0;
        }
        
        .toc {
            border: 1px solid var(--border-color);
            border-radius: 5px;
            padding: 15px;
            background-color: var(--light-bg);
        }
        
        .toc h2 {
            margin-top: 0;
            font-size: 1.3rem;
            border-bottom: none;
        }
        
        .toc ul {
            list-style-type: none;
            padding-left: 15px;
        }
        
        .toc li {
            margin: 5px 0;
        }
        
        .endpoint {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid var(--border-color);
            border-radius: 5px;
            background-color: white;
        }
        
        .endpoint-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .http-method {
            padding: 5px 10px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            font-size: 0.9rem;
            margin-right: 10px;
        }
        
        .http-method.get {
            background-color: var(--info-color);
        }
        
        .http-method.post {
            background-color: var(--success-color);
        }
        
        .http-method.put {
            background-color: var(--warning-color);
            color: #212529;
        }
        
        .http-method.delete {
            background-color: var(--danger-color);
        }
        
        .url-path {
            font-family: monospace;
            font-size: 1.1rem;
            word-break: break-all;
        }
        
        .endpoint-details {
            margin-top: 15px;
        }
        
        .params-section {
            margin-top: 20px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }
        
        th, td {
            padding: 10px;
            border: 1px solid var(--border-color);
            text-align: left;
        }
        
        th {
            background-color: var(--light-bg);
            font-weight: 600;
        }
        
        .folder-description {
            margin-bottom: 20px;
        }
        
        .badge {
            display: inline-block;
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-left: 5px;
        }
        
        .badge-required {
            background-color: var(--danger-color);
            color: white;
        }
        
        .response-example {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid var(--border-color);
            border-radius: 5px;
            background-color: #fafafa;
        }
        
        .response-example h6 {
            margin-top: 0;
            margin-bottom: 10px;
            color: var(--primary-color);
            font-size: 1rem;
        }
        
        .response-example pre {
            margin-top: 10px;
            background-color: white;
        }
        
        .response-body {
            position: relative;
        }
        
        .response-body.collapsed pre {
            max-height: 240px;
            overflow: hidden;
        }
        
        .response-body.collapsed::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: linear-gradient(transparent, white);
            pointer-events: none;
        }
        
        .expand-button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            margin-top: 10px;
            transition: background-color 0.2s;
        }
        
        .expand-button:hover {
            background-color: #3654b8;
        }
        
        .expand-button.expanded {
            background-color: var(--secondary-color);
        }
        
        .expand-button.expanded:hover {
            background-color: #545b62;
        }
        
        @media (max-width: 768px) {
            .container {
                flex-direction: column;
            }
            
            .sidebar {
                flex: 0 0 100%;
                margin-bottom: 30px;
                position: static;
                max-height: none;
            }
            
            .header-content {
                flex-direction: column;
                text-align: center;
            }
            
            .header-text {
                order: 2;
            }
            
            .header-logo {
                order: 1;
            }
            
            .logo {
                height: 60px;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="header-content">
            <div class="header-text">
                <h1>${info.name}</h1>
                <div class="generation-date">Documentation générée le ${formattedDate}</div>
            </div>
            <div class="header-logo">
                <img src="VXCORE-VMS-BLEU.svg" alt="VXCore VMS Logo" class="logo">
            </div>
        </div>
    </header>
    
    <div class="container">
        <div class="sidebar">
            <div class="toc">
                <h2>Table des matières</h2>
                <ul>
                    <li><a href="#overview">Généralités</a></li>
                    ${generateTableOfContents(folders)}
                </ul>
            </div>
        </div>
        
        <div class="content">
            <section id="overview">
                ${converter.makeHtml(
                  info.description || "No description available."
                )}
            </section>
            
            ${generateFoldersContent(folders)}
        </div>
    </div>
    
    <script>
        // Handle expand/collapse functionality for response examples
        document.addEventListener('DOMContentLoaded', function() {
            const expandButtons = document.querySelectorAll('.expand-button');
            
            expandButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const responseBody = this.previousElementSibling;
                    const isCollapsed = responseBody.classList.contains('collapsed');
                    
                    if (isCollapsed) {
                        responseBody.classList.remove('collapsed');
                        this.textContent = 'Réduire';
                        this.classList.add('expanded');
                    } else {
                        responseBody.classList.add('collapsed');
                        this.textContent = 'Afficher tout';
                        this.classList.remove('expanded');
                    }
                });
            });
        });
    </script>
</body>
</html>
  `;

  // Write the documentation to the output file
  fs.writeFileSync(outputFile, htmlContent);
  console.log(`Documentation successfully generated: ${outputFile}`);
}

function generateTableOfContents(folders) {
  let toc = "";

  folders.forEach((folder) => {
    toc += generateTocItem(folder, []);
  });

  return toc;
}

function generateTocItem(item, parentPath) {
  const itemPath = [...parentPath, item.name];
  const itemId = getFolderId(itemPath.join("-"));
  let toc = `<li><a href="#${itemId}">${item.name}</a>`;

  if (item.item && item.item.length > 0) {
    toc += "<ul>";

    item.item.forEach((subItem) => {
      if (isFolder(subItem)) {
        // Recursive call for nested folders
        toc += generateTocItem(subItem, itemPath);
      } else {
        // Direct endpoint
        const endpointId = getEndpointId(itemPath, subItem.name);
        toc += `<li><a href="#${endpointId}">${subItem.name}</a></li>`;
      }
    });

    toc += "</ul>";
  }

  toc += "</li>";
  return toc;
}

function generateFoldersContent(folders) {
  let content = "";

  folders.forEach((folder) => {
    content += generateFolderContent(folder, [], 2);
  });

  return content;
}

function generateFolderContent(item, parentPath, headerLevel) {
  const itemPath = [...parentPath, item.name];
  const itemId = getFolderId(itemPath.join("-"));
  const headerTag = `h${headerLevel}`;

  let content = `<section id="${itemId}">
    <${headerTag}>${item.name}</${headerTag}>`;

  if (item.description) {
    content += `<div class="folder-description">${converter.makeHtml(
      item.description
    )}</div>`;
  }

  if (item.item && item.item.length > 0) {
    item.item.forEach((subItem) => {
      if (isFolder(subItem)) {
        // Recursive call for nested folders with increased header level
        content += generateFolderContent(
          subItem,
          itemPath,
          Math.min(headerLevel + 1, 6)
        );
      } else {
        // Direct endpoint
        content += generateEndpointContent(itemPath, subItem);
      }
    });
  }

  content += "</section>";
  return content;
}

function generateEndpointContent(parentPath, endpoint) {
  const endpointId = getEndpointId(parentPath, endpoint.name);
  const request = endpoint.request;

  if (!request) {
    return `<div class="endpoint" id="${endpointId}">
      <h4>${endpoint.name}</h4>
      <p>No request information available.</p>
    </div>`;
  }

  const method = request.method || "GET";
  const methodClass = method.toLowerCase();

  // Format URL
  let url = "";
  if (typeof request.url === "string") {
    url = cleanPostmanVariables(request.url);
  } else if (request.url && request.url.raw) {
    url = cleanPostmanVariables(request.url.raw);
  }

  // Format URL path
  let urlPath = "";
  if (request.url && request.url.path) {
    urlPath = "/" + request.url.path.map(cleanPostmanVariables).join("/");
  }

  // Get query parameters
  const queryParams = [];
  if (request.url && request.url.query) {
    request.url.query.forEach((param) => {
      queryParams.push(param);
    });
  }

  // Format headers
  const headers = [];
  if (request.header) {
    request.header.forEach((header) => {
      headers.push(header);
    });
  }

  let endpointContent = `<div class="endpoint" id="${endpointId}">
    <div class="endpoint-header">
      <span class="http-method ${methodClass}">${method}</span>
      <span class="url-path">${urlPath || url}</span>
    </div>
    
    <h3>${endpoint.name}</h3>
    
    ${
      endpoint.description || request.description
        ? `<div class="endpoint-description">${converter.makeHtml(
            endpoint.description || request.description
          )}</div>`
        : ""
    }
    
    <div class="endpoint-details">`;

  // Query Parameters (exclude token as it's explained in the main description)
  const filteredQueryParams = queryParams.filter(
    (param) =>
      param.key &&
      param.key.toLowerCase() !== "token" &&
      param.key.toLowerCase() !== "key"
  );

  if (filteredQueryParams.length > 0) {
    endpointContent += `<div class="params-section">
      <h4>Query Parameters</h4>
      <table>
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Value</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>`;

    filteredQueryParams.forEach((param) => {
      endpointContent += `<tr>
        <td>${param.key}</td>
        <td>${cleanPostmanVariables(param.value || "")}</td>
        <td>${escapeHtml(param.description || "")}</td>
      </tr>`;
    });

    endpointContent += `</tbody>
      </table>
    </div>`;
  }

  // Headers
  if (headers.length > 0) {
    endpointContent += `<div class="params-section">
      <h5>Headers</h5>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>`;

    headers.forEach((header) => {
      endpointContent += `<tr>
        <td>${header.key}</td>
        <td>${cleanPostmanVariables(header.value || "")}</td>
      </tr>`;
    });

    endpointContent += `</tbody>
      </table>
    </div>`;
  }

  // Request Body
  if (request.body) {
    const body = request.body;

    if (body.mode === "raw" && body.raw) {
      let rawBody = cleanPostmanVariables(body.raw);
      let language = "text";

      if (body.options && body.options.raw && body.options.raw.language) {
        language = body.options.raw.language;
      }

      endpointContent += `<div class="params-section">
        <h4>Request Body</h4>
        <pre><code class="language-${language}">${rawBody}</code></pre>
      </div>`;
    } else if (body.mode === "formdata" && body.formdata) {
      endpointContent += `<div class="params-section">
        <h4>Form Data</h4>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>`;

      body.formdata.forEach((param) => {
        endpointContent += `<tr>
          <td>${param.key}</td>
          <td>${cleanPostmanVariables(param.value || "")}</td>
          <td>${param.type || "text"}</td>
        </tr>`;
      });

      endpointContent += `</tbody>
        </table>
      </div>`;
    }
  }

  // Response Examples
  if (endpoint.response && endpoint.response.length > 0) {
    endpointContent += `<div class="params-section">
      <h4>Response Examples</h4>`;

    endpoint.response.forEach((response, index) => {
      // Determine content type from headers
      let contentType = "text/plain";
      let language = "text";

      if (response.header) {
        const contentTypeHeader = response.header.find(
          (h) => h.key && h.key.toLowerCase() === "content-type"
        );
        if (contentTypeHeader && contentTypeHeader.value) {
          contentType = contentTypeHeader.value.toLowerCase();

          // Map content types to languages for syntax highlighting
          if (contentType.includes("json")) {
            language = "json";
          } else if (contentType.includes("xml")) {
            language = "xml";
          } else if (contentType.includes("html")) {
            language = "html";
          } else if (contentType.includes("javascript")) {
            language = "javascript";
          }
        }
      }

      // Use _postman_previewlanguage if available
      if (response._postman_previewlanguage) {
        language = response._postman_previewlanguage;
      }

      endpointContent += `<div class="response-example">
        ${
          contentType !== "text/plain"
            ? `<p><strong>Content-Type:</strong> ${contentType}</p>`
            : ""
        }`;

      if (response.body) {
        // Format the response body based on content type
        let formattedBody = response.body;

        // Try to pretty-print JSON
        if (language === "json") {
          try {
            const parsed = JSON.parse(response.body);
            formattedBody = JSON.stringify(parsed, null, 2);
          } catch (e) {
            // Keep original if parsing fails
            formattedBody = response.body;
          }
        }

        // Check if response is long (more than 10 lines)
        const lineCount = formattedBody.split("\n").length;
        const isLong = lineCount > 10;

        endpointContent += `<div class="response-body${
          isLong ? " collapsed" : ""
        }">
          <pre><code class="language-${language}">${formattedBody}</code></pre>
        </div>`;

        if (isLong) {
          endpointContent += `<button class="expand-button">Afficher tout</button>`;
        }
      }

      endpointContent += `</div>`;
    });

    endpointContent += `</div>`;
  }

  endpointContent += `</div>
  </div>`;

  return endpointContent;
}

function isFolder(item) {
  return item.item && Array.isArray(item.item);
}

function getFolderId(folderPath) {
  if (typeof folderPath === "string") {
    return `folder-${slugify(folderPath)}`;
  }
  // For array of path segments
  return `folder-${folderPath.map(slugify).join("-")}`;
}

function getEndpointId(parentPath, endpointName) {
  if (Array.isArray(parentPath)) {
    return `endpoint-${parentPath.map(slugify).join("-")}-${slugify(
      endpointName
    )}`;
  }
  if (typeof parentPath === "string") {
    return `endpoint-${slugify(parentPath)}-${slugify(endpointName)}`;
  }
  return `endpoint-${slugify(endpointName)}`;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function cleanPostmanVariables(text) {
  if (typeof text !== "string") return text;
  // Remove Postman variables in the format {{VARIABLE_NAME}}
  return text.replace(/\{\{([^}]+)\}\}/g, "$1");
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\n/g, "<br>")
    .replace(/\\n/g, "<br>");
}
