import fetch from "node-fetch";

// Base URL for the Books Form RESTful API
const API_BASE_URL = "https://comp2140a3.uqcloud.net/api";

// JWT token for authorization, replace with your actual token from My Grades in Blackboard
// From the A2 JSON Web Token column, view Feedback to show your JWT
// The JWT for A3 is the same as A2
const JWT_TOKEN = "INSERTYOURTOKENHERE";

// Your UQ student username, used for row-level security to retrieve your records
const USERNAME = "s100000000";


/**
 * Helper function to handle API requests.
 * It sets the Authorization token and optionally includes the request body.
 * 
 * @param {string} endpoint - The API endpoint to call (e.g., "/form", "/field").
 * @param {string} [method='GET'] - The HTTP method to use (GET, POST, PATCH).
 * @param {object|null} [body=null] - The request body to send, typically for POST or PATCH.
 * @returns {Promise<object>} - The JSON response from the API.
 * @throws Will throw an error if the HTTP response is not OK.
 */
async function apiRequest(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JWT_TOKEN}`, // Include the JWT token for authentication
    },
  };

  // If the method is POST or PATCH, we want the response to include the full representation
  if (method === "POST" || method === "PATCH") {
    options.headers["Prefer"] = "return=representation";
  }

  // If a body is provided, add it to the request and include the username
  if (body) {
    options.body = JSON.stringify({ ...body, username: USERNAME });
  }

  // Make the API request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} – ${errText}`);
  }

  // Return the response as JSON
  return response.json();
}

/**
 * Function to create a new form called "Books".
 * 
 * @returns {Promise<object>} - The created form object.
 */
async function createForm() {
  return apiRequest("/form", "POST", {
    name: "Books",
    description: "A form to store details about my programming books",
  });
}

/**
 * Function to insert a single field for the form.
 * Call this function once for each field you want to add.
 * 
 * @param {number} formId - The ID of the form to attach this field to.
 * @param {object} field - The field definition object.
 * @returns {Promise<object>} - The created field object.
 */
async function insertField(formId, field) {
  return apiRequest("/field", "POST", {
    ...field,
    form_id: formId,
  });
}

/**
 * Function to insert a single record (book entry) into the form.
 * 
 * @param {number} formId - The ID of the form to attach this record to.
 * @param {object} record - The record data (with a "values" object).
 * @returns {Promise<object>} - The created record object.
 */
async function insertRecord(formId, record) {
  return apiRequest("/record", "POST", {
    ...record,
    form_id: formId,
  });
}

/**
 * Function to filter records by JSONB fields.
 * Example: category contains "JavaScript" AND price > 50.
 * 
 * @param {number} formId - The ID of the form whose records you want to filter.
 * @returns {Promise<Array>} - An array of matching record objects.
 */
async function filterRecords(formId) {
  // Encoded query string (values->>'category' ILIKE '%JavaScript%' AND values->'price' < 50)
  // Note url encoding of > and placing quotes around keys
  // Note ->> for strings and -> for numbers
  const query =
    `/record?form_id=eq.${formId}` +
    `&values-%3E%3E%22category%22=ilike.*JavaScript*` +
    `&values-%3E%22price%22=lt.50`;

  return apiRequest(query);
}

/**
 * Main function to demonstrate API usage for the Books form.
 * 
 * Steps:
 *   1. Create the "Books" form.
 *   2. Insert fields (title, category, price).
 *   3. Insert book records (examples).
 *   4. Filter records by conditions.
 */
async function main() {
  try {
    // 1. Create form
    const createdForm = await createForm();
    const formId = createdForm[0].id;
    console.log("Created form:", createdForm);

    // 2. Insert fields one by one
    const field1 = await insertField(formId, {
      name: "title",
      field_type: "text",
      required: true,
      order_index: 0,
    });
    const field2 = await insertField(formId, {
      name: "category",
      field_type: "dropdown",
      required: true,
      options: { choices: ["JavaScript", "Python", "Databases"] },
      order_index: 1,
    });
    const field3 = await insertField(formId, {
      name: "price",
      field_type: "text",
      required: true,
      is_num: true,
      order_index: 2,
    });
    console.log("Inserted fields:", [field1, field2, field3]);

    // 3. Insert records one by one
    const rec1 = await insertRecord(formId, {
      values: { title: "Eloquent JavaScript", category: "JavaScript", price: 45 },
    });
    const rec2 = await insertRecord(formId, {
      values: { title: "Fluent Python", category: "Python", price: 60 },
    });
    const rec3 = await insertRecord(formId, {
      values: {
        title: "Designing Data-Intensive Applications",
        category: "Databases",
        price: 80,
      },
    });
    console.log("Inserted records:", [rec1, rec2, rec3]);

    // 4. Filter records
    const filtered = await filterRecords(formId);
    console.log("Filtered records:", filtered);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

// Execute the main function
main();
