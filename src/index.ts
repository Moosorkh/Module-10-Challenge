import { pool } from "./db/connection.js";
import inquirer from "inquirer";

async function startApp() {
  const { action } = await inquirer.prompt({
    name: "action",
    type: "list",
    message: "What would you like to do?",
    choices: [
      "View all departments",
      "View all roles",
      "View all employees",
      "Add a department",
      "Add a role",
      "Add an employee",
      "Update an employee role",
    ],
  });

  switch (action) {
    case "View all departments":
      await viewDepartments();
      break;
    case "View all roles":
      await viewRoles();
      break;
    case "View all employees":
      await viewEmployees();
      break;
    case "Add a department":
      await addDepartment();
      break;
    case "Add a role":
      await addRole();
      break;
    case "Add an employee":
      await addEmployee();
      break;
    case "Update an employee role":
      await updateEmployeeRole();
      break;
  }

  startApp();
}

// Define helper functions here (viewDepartments, viewRoles, etc.)
startApp();

async function viewDepartments() {
  const result = await pool.query("SELECT * FROM department");
  console.table(result.rows);
}

async function addDepartment() {
  const { departmentName } = await inquirer.prompt({
    name: "departmentName",
    type: "input",
    message: "Enter the name of the department:",
  });

  await pool.query("INSERT INTO department (name) VALUES ($1)", [
    departmentName,
  ]);
  console.log(`Added ${departmentName} to departments.`);
}
