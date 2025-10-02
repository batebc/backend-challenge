import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { readFileSync } from "fs";
import { join } from "path";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const path = event.path;

  // 1. Servir la UI (Swagger visual)
  if (path === "/docs" || path === "/docs/") {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Medical Appointment API - Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/dev/docs/openapi.yaml",   // 👈 importante: API Gateway prefix
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout"
      });
    };
  </script>
</body>
</html>
    `;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html",
      },
      body: html,
    };
  }

  // 2. Servir el YAML (para Swagger)
  if (path === "/docs/openapi.yaml") {
    try {
      const yamlPath = join(process.cwd(), "openapi.yaml"); // 👈 raíz del bundle
      const yamlContent = readFileSync(yamlPath, "utf8");

      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/yaml",
          "Access-Control-Allow-Origin": "*",
        },
        body: yamlContent,
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to load OpenAPI spec" }),
      };
    }
  }

  // 3. Rutas no encontradas
  return {
    statusCode: 404,
    body: JSON.stringify({ error: "Not found" }),
  };
};
