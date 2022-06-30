
// FOR SWAGGER API DOCS

const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJSDocs = YAML.load("./api.yaml");
const swaggerJsdoc = require("swagger-jsdoc");
// ===============================================


const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
      title: "Swagger API Tutorial - Poopcode.com",
      version: "1.0.0",
      description:
        "A sample project to understand how easy it is to document and Express API",
    },
   components: {
      securitySchemes: {
        jwt: {
          type: "http",
          scheme: "bearer",
          in: "header",
          bearerFormat: "JWT"
        },
      }
    },
    security: [{
      jwt: []
    }],
  }


var options = {
  swaggerDefinition,
  apis: ['./routes/InstituteAdmin/instituteRoute.js'],
};

const swaggerSpec = swaggerJsdoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
