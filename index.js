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
  tables: true,
  tasklists: true,
  strikethrough: true,
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
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        header {
            margin-bottom: 30px;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 20px;
        }
        
        .generation-date {
            color: var(--secondary-color);
            font-size: 0.9rem;
            margin-top: 5px;
        }
        
        h1, h2, h3, h4, h5, h6 {
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            font-weight: 600;
            line-height: 1.25;
        }
        
        h1 {
            font-size: 2.5rem;
            color: var(--primary-color);
        }
        
        h2 {
            font-size: 1.8rem;
            padding-bottom: 0.3rem;
            border-bottom: 1px solid var(--border-color);
            margin-top: 2.5rem;
        }
        
        h3 {
            font-size: 1.4rem;
            color: var(--secondary-color);
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
            flex: 0 0 250px;
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
        }
    </style>
</head>
<body>
    <header>
        <h1>${info.name}</h1>
        <div class="generation-date">Generated on: ${formattedDate}</div>
    </header>
    
    <div class="container">
        <div class="sidebar">
            <div class="toc">
                <h2>Table of Contents</h2>
                <ul>
                    <li><a href="#overview">Overview</a></li>
                    ${generateTableOfContents(folders)}
                </ul>
            </div>
        </div>
        
        <div class="content">
            <section id="overview">
                <h2>Overview</h2>
                ${converter.makeHtml(
                  info.description || "No description available."
                )}
            </section>
            
            ${generateFoldersContent(folders)}
        </div>
    </div>
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
    const folderId = getFolderId(folder.name);
    toc += `<li><a href="#${folderId}">${folder.name}</a>`;

    if (folder.item && folder.item.length > 0) {
      toc += "<ul>";

      if (hasNestedFolders(folder)) {
        // Folder has nested folders
        folder.item.forEach((subFolder) => {
          if (isFolder(subFolder)) {
            const subFolderId = getFolderId(`${folder.name}-${subFolder.name}`);
            toc += `<li><a href="#${subFolderId}">${subFolder.name}</a>`;

            if (subFolder.item && subFolder.item.length > 0) {
              toc += "<ul>";
              subFolder.item.forEach((endpoint) => {
                if (!isFolder(endpoint)) {
                  const endpointId = getEndpointId(
                    folder.name,
                    subFolder.name,
                    endpoint.name
                  );
                  toc += `<li><a href="#${endpointId}">${endpoint.name}</a></li>`;
                }
              });
              toc += "</ul>";
            }

            toc += "</li>";
          } else {
            // Direct endpoint under main folder
            const endpointId = getEndpointId(folder.name, null, subFolder.name);
            toc += `<li><a href="#${endpointId}">${subFolder.name}</a></li>`;
          }
        });
      } else {
        // Folder has only endpoints
        folder.item.forEach((endpoint) => {
          const endpointId = getEndpointId(folder.name, null, endpoint.name);
          toc += `<li><a href="#${endpointId}">${endpoint.name}</a></li>`;
        });
      }

      toc += "</ul>";
    }

    toc += "</li>";
  });

  return toc;
}

function generateFoldersContent(folders) {
  let content = "";

  folders.forEach((folder) => {
    const folderId = getFolderId(folder.name);
    content += `<section id="${folderId}">
      <h2>${folder.name}</h2>`;

    if (folder.description) {
      content += `<div class="folder-description">${converter.makeHtml(
        folder.description
      )}</div>`;
    }

    if (hasNestedFolders(folder)) {
      // Folder has nested folders
      folder.item.forEach((subFolder) => {
        if (isFolder(subFolder)) {
          const subFolderId = getFolderId(`${folder.name}-${subFolder.name}`);
          content += `<section id="${subFolderId}">
            <h3>${subFolder.name}</h3>`;

          if (subFolder.description) {
            content += `<div class="folder-description">${converter.makeHtml(
              subFolder.description
            )}</div>`;
          }

          subFolder.item.forEach((endpoint) => {
            if (!isFolder(endpoint)) {
              content += generateEndpointContent(
                folder.name,
                subFolder.name,
                endpoint
              );
            }
          });

          content += "</section>";
        } else {
          // Direct endpoint under main folder
          content += generateEndpointContent(folder.name, null, subFolder);
        }
      });
    } else {
      // Folder has only endpoints
      folder.item.forEach((endpoint) => {
        content += generateEndpointContent(folder.name, null, endpoint);
      });
    }

    content += "</section>";
  });

  return content;
}

function generateEndpointContent(folderName, subFolderName, endpoint) {
  const endpointId = getEndpointId(folderName, subFolderName, endpoint.name);
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
    url = request.url;
  } else if (request.url && request.url.raw) {
    url = request.url.raw;
  }

  // Format URL path
  let urlPath = "";
  if (request.url && request.url.path) {
    urlPath = "/" + request.url.path.join("/");
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
    
    <h4>${endpoint.name}</h4>
    
    ${
      endpoint.description
        ? `<div class="endpoint-description">${converter.makeHtml(
            endpoint.description
          )}</div>`
        : ""
    }
    
    <div class="endpoint-details">`;

  // Query Parameters
  if (queryParams.length > 0) {
    endpointContent += `<div class="params-section">
      <h5>Query Parameters</h5>
      <table>
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Value</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>`;

    queryParams.forEach((param) => {
      endpointContent += `<tr>
        <td>${param.key}</td>
        <td>${param.value || ""}</td>
        <td>${param.description || ""}</td>
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
        <td>${header.value || ""}</td>
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
      let rawBody = body.raw;
      let language = "text";

      if (body.options && body.options.raw && body.options.raw.language) {
        language = body.options.raw.language;
      }

      endpointContent += `<div class="params-section">
        <h5>Request Body</h5>
        <pre><code class="language-${language}">${escapeHtml(
        rawBody
      )}</code></pre>
      </div>`;
    } else if (body.mode === "formdata" && body.formdata) {
      endpointContent += `<div class="params-section">
        <h5>Form Data</h5>
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
          <td>${param.value || ""}</td>
          <td>${param.type || "text"}</td>
        </tr>`;
      });

      endpointContent += `</tbody>
        </table>
      </div>`;
    }
  }

  endpointContent += `</div>
  </div>`;

  return endpointContent;
}

function hasNestedFolders(folder) {
  if (!folder.item || folder.item.length === 0) {
    return false;
  }

  return folder.item.some((item) => isFolder(item));
}

function isFolder(item) {
  return item.item && Array.isArray(item.item);
}

function getFolderId(folderName) {
  return `folder-${slugify(folderName)}`;
}

function getEndpointId(folderName, subFolderName, endpointName) {
  if (subFolderName) {
    return `endpoint-${slugify(folderName)}-${slugify(subFolderName)}-${slugify(
      endpointName
    )}`;
  }
  return `endpoint-${slugify(folderName)}-${slugify(endpointName)}`;
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

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
