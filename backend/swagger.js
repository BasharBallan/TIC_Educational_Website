const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TIC API Documentation",
      version: "1.0.0",
      description: `
# 🔐 Authentication Guide

This API uses **JWT Bearer Tokens** for authentication.  
To test protected endpoints, follow the steps below.

---

## 🚀 How to Use Tokens in Swagger

1. Click the **Authorize** button at the top-right corner of the Swagger UI.
2. Enter your token in the following format:

\`\`\`
Bearer YOUR_TOKEN_HERE
\`\`\`

3. Click **Authorize**, then **Close**.
4. Now you can test any protected API.

---

## 🟦 Ready-to-Use Test Tokens

Use these tokens to test the API without needing to log in.

### 👑 Admin Token
<div style="display:flex;align-items:center;gap:10px;">
  <code id="adminToken">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTZlOGZkNjAyYzk2ZTQwZmMzMTA5MzciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODU2MzA3MzAsImV4cCI6MTc4NTYzMjUzMH0.C-gYDQM2t4bnIki8AfcVlG5OmZkAVDyFmToS-hE_mlc</code>
  <button onclick="navigator.clipboard.writeText(document.getElementById('adminToken').innerText)">Copy</button>
</div>

### 🩺 Doctor Token
<div style="display:flex;align-items:center;gap:10px;">
  <code id="doctorToken">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWEwM2FiMDc5YTE2ODAxZGIzOGUxNzIiLCJpYXQiOjE3NzIyMzE0NDMsImV4cCI6Nzk1MzIyMzE0NDN9.DFI9Xn_5o8A1a5s5nDApoP-XuOvSP41mXLH8cnHxfDo</code>
  <button onclick="navigator.clipboard.writeText(document.getElementById('doctorToken').innerText)">Copy</button>
</div>

### 🎓 Student Token
<div style="display:flex;align-items:center;gap:10px;">
  <code id="studentToken">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTZlOGYxMTE1YzU3NTkxZmZmNzc4YmMiLCJpYXQiOjE3ODU2MzA0ODIsImV4cCI6MTc4NTYzMjI4Mn0.j8qq4UGum5kogKRH_vvaT7ArMq3rzcLn_SOBWRBvwbk</code>
  <button onclick="navigator.clipboard.writeText(document.getElementById('studentToken').innerText)">Copy</button>
</div>


---

## 📌 Notes
- These tokens are for **testing only**.
- Do NOT use them in production environments.
- If you receive a **401 Unauthorized**, make sure you used the correct token for the required role.
- Endpoints specify which role is required (Admin / Doctor / Student).

Enjoy testing your API!
      `,
    },

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [{ bearerAuth: [] }],
  },

  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = { swaggerUi, swaggerSpec };
