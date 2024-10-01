# Module-10-Challenge

# Employee Tracker

## Description

This Employee Management System is a command-line interface (CLI) tool designed to manage company departments, roles, and employees. It allows users to view, add, and update departments, roles, and employees in a PostgreSQL database. 

- **Motivation**: The motivation for this project was to practice building an interactive CLI tool using Node.js, PostgreSQL, and Inquirer.js while managing relational data efficiently.
- **Why this project?**: It solves the common problem of managing employee information and organizational structures in small to medium-sized businesses without relying on expensive software packages.
- **What problem does it solve?**: It helps track employees, their roles, and departments, allowing for smooth operations management and role assignments.
- **What did I learn?**: I gained experience in database management, building interactive CLI applications, using PostgreSQL, and handling database queries with Node.js.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Code_Samples](#code_samples)
- [GitHub](#github)
- [Video](#video)


## Installation

To install and run this project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone <repo-url>
   ```

2. Install dependencies:
```bash
   npm install
```

3. Create a .env file in the root directory and set up your environment variables:
```bash
DB_USER='your-username'
DB_PASSWORD='your-password'
DB_NAME='employees_db'
```

4. Set up the database:

Make sure PostgreSQL is installed and running on your machine.
Execute the schema.sql file to create the necessary tables:
```bash
psql -U postgres -f src/db/schema.sql
```

5. Seed the database with initial data:
```bash
psql -U postgres -d employees_db -f src/db/seeds.sql
```

6. Compile the TypeScript files:
```bash
npm run build
```

7. Start the application:
```bash
node dist/index.js
```

## Usage
Once the application is running, you will be prompted with a series of options to choose from. You can view, add, or update departments, roles, and employees.

## Code_Samples

### From the index.ts
```ts
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
      "Exit",
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
    case "Exit":
      console.log("Goodbye!");
      process.exit(); // Exit the process gracefully
  }

  startApp();
}
```

### viewDepartments function

```ts
async function viewDepartments() {
  try {
    const result = await pool.query("SELECT * FROM department");
    console.table(result.rows);
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
}
```
### addDepartment function
```ts
async function addDepartment() {
  try {
    const { departmentName } = await inquirer.prompt({
      name: "departmentName",
      type: "input",
      message: "Enter the name of the department:",
    });

    await pool.query("INSERT INTO department (name) VALUES ($1)", [
      departmentName,
    ]);
    console.log(`Added ${departmentName} to departments.`);
  } catch (error) {
    console.error("Error adding department:", error);
  }
}
```

### viewRoles function
```ts
async function viewRoles() {
  try {
    const result = await pool.query("SELECT * FROM role");
    console.table(result.rows);
  } catch (error) {
    console.error("Error fetching roles:", error);
  }
}
```

### addRole function 
```ts
async function addRole() {
 try {
   // Fetch the departments from the database
   const departmentResult = await pool.query("SELECT * FROM department");
   const departments = departmentResult.rows;

   // Map the departments to an array of choices for inquirer
   const departmentChoices = departments.map((department) => ({
     name: department.name,
     value: department.id, // Store the department ID as the value
   }));

   // Prompt the user for the role details
   const { title, salary, departmentId } = await inquirer.prompt([
     {
       name: "title",
       type: "input",
       message: "Enter the title of the role:",
     },
     {
       name: "salary",
       type: "input",
       message: "Enter the salary of the role:",
       validate: (input) => !isNaN(Number(input)) || "Salary must be a number",
     },
     {
       name: "departmentId",
       type: "list",
       message: "Which department does the role belong to?",
       choices: departmentChoices, // Present the departments as choices
     },
   ]);

   // Insert the new role into the database
   await pool.query(
     "INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)",
     [title, salary, departmentId]
   );
   console.log(`Added ${title} to roles.`);
 } catch (error) {
   console.error("Error adding role:", error);
 }
}
```
### viewEmployees
```ts
async function viewEmployees() {
  try {
    const result = await pool.query("SELECT * FROM employee");
    console.table(result.rows);
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
}
```
### addEmployee
```ts
async function addEmployee() {
  try {
    // Fetch the roles from the database
    const roleResult = await pool.query("SELECT * FROM role");
    const roles = roleResult.rows;

    // Fetch the employees (for manager selection)
    const managerResult = await pool.query("SELECT * FROM employee");
    const employees = managerResult.rows;

    // Map roles to choices
    const roleChoices = roles.map((role) => ({
      name: role.title,
      value: role.id,
    }));

    // Map employees to choices for managers
    const managerChoices = employees.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));

    // Add an option for 'No Manager'
    managerChoices.push({ name: "None", value: null });

    // Prompt the user for the employee details
    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
      {
        name: "firstName",
        type: "input",
        message: "Enter the first name of the employee:",
      },
      {
        name: "lastName",
        type: "input",
        message: "Enter the last name of the employee:",
      },
      {
        name: "roleId",
        type: "list",
        message: "What is the employee's role?",
        choices: roleChoices, // List of roles
      },
      {
        name: "managerId",
        type: "list",
        message: "Who is the employee's manager?",
        choices: managerChoices, // List of managers with "None" as an option
      },
    ]);

    // Insert the new employee into the database
    await pool.query(
      "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
      [firstName, lastName, roleId, managerId]
    );
    console.log(`Added ${firstName} ${lastName} to employees.`);
  } catch (error) {
    console.error("Error adding employee:", error);
  }
}
```
### updateEmployeeRole function
```ts
async function updateEmployeeRole() {
  try {
    // Fetch the employees from the database
    const employeeResult = await pool.query("SELECT * FROM employee");
    const employees = employeeResult.rows;

    // Fetch the roles from the database
    const roleResult = await pool.query("SELECT * FROM role");
    const roles = roleResult.rows;

    // Map employees to choices
    const employeeChoices = employees.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));

    // Map roles to choices
    const roleChoices = roles.map((role) => ({
      name: role.title,
      value: role.id,
    }));

    // Prompt the user to select the employee and the new role
    const { employeeId, roleId } = await inquirer.prompt([
      {
        name: "employeeId",
        type: "list",
        message: "Which employee's role do you want to update?",
        choices: employeeChoices, // List of employees
      },
      {
        name: "roleId",
        type: "list",
        message: "What is the employee's new role?",
        choices: roleChoices, // List of roles
      },
    ]);

    // Update the employee's role in the database
    await pool.query("UPDATE employee SET role_id = $1 WHERE id = $2", [
      roleId,
      employeeId,
    ]);
    console.log(`Updated role of employee with ID ${employeeId} to ${roleId}.`);
  } catch (error) {
    console.error("Error updating employee role:", error);
  }
}


// Start the application
startApp();

```

## Example Workflow:
1. Start the application.
2. Select "View all departments" to see all departments in the system.
3. Choose "Add a role" to create a new role in an existing department.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.

## Features
- View all departments, roles, and employees
- Add departments, roles, and employees
- Update employee roles
- Easy to navigate CLI interface

## How to Contribute
If you'd like to contribute, please follow these guidelines:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
```bash
git checkout -b feature/your-feature-name
```
3. Commit your changes:
```bash
git commit -m 'Add new feature'
```

4. Push to the branch:
```bash
git push origin feature/your-feature-name
```

5. Open a pull request.


## GitHub
- [GitHub Repository](#https://github.com/Moosorkh/Module-10-Challenge.git)

## Video
-  [Walkthrough Video](#https://drive.google.com/file/d/1J-LWXt5jpC78d3yEiUVjXQOtFlWO9llT/preview)