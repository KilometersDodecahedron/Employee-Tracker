//access Main Menu functions
const openingMenu = require("./index");

const inquirer = require("inquirer");

//used by viewEmployees to get a list of managers
const selfJoinQuery = `SELECT DISTINCT A.first_name AS manager_firstName, A.last_name AS manager_lastName, A.id
FROM employees A, employees B
WHERE A.id = B.manager_id`;

//run by index.js
const viewData = () => {
    openingMenu.makeNewLine();
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to examine?",
            name: "answer",
            choices: ["Employees", "Roles", "Departments", "Back to Main Menu"]
        }
    ]).then(answer => {
        switch(answer.answer){
            case "Employees":
                //TODO finish
                openingMenu.makeNewLine();
                viewEmployees();
                break;
            case "Roles":
                openingMenu.makeNewLine();
                viewRoles();
                break;
            case "Departments":
                openingMenu.makeNewLine();
                viewDepartments();
                break;
            case "Back to Main Menu":
                openingMenu.openingMenu();
                break;
        }
    });
}

const viewDepartments = () => {
    //start by getting list of roles
    openingMenu.connection.query("SELECT * FROM roles", (err, roles) => {
        if(err) throw err;
        //then gets the departments
        openingMenu.connection.query("SELECT * FROM departments", (err, departments) => {
            if(err) throw err;
            //display each deparment, along with their roles
            departments.forEach(element => {
                let relevantRoles = roles.map(object =>{
                    if(object.department_id == element.id){
                        return object.title;
                    };
                });
                relevantRoles = relevantRoles.join(" ");
                if(relevantRoles == " "){
                    relevantRoles = "none";
                }
                console.log(element.name + ` (Roles in Department: ${relevantRoles})`);
            });
            viewData();
        });
    });  
}

//practicing using Promises. Use "*" to get all the columns, use an array to get multiple
const getColumnFromTable = (column, table) => {
    return new Promise((resolve, reject) => {
        var query = `SELECT ${column} FROM ${table}`;
        openingMenu.connection.query(query, (err, data) => {
            if(err) throw err;
            resolve(data);
        });
    });
}

const viewRoles = () => {
    getColumnFromTable("*", "departments").then(data => {
        var depList = [];
        var depIds = [];
        //stores list of departments for inquirer
        data.forEach(object => {
            depList.push(object.name);
            depIds.push(object.id);
        });

        inquirer.prompt([
            {
                type: "list",
                message: "What would you like to see?",
                name: "search",
                choices: ["All Roles", "Only Roles With A Deparment", "Search Roles By Department"]
            },
            {
                type: "list",
                message: "Which Department?",
                name: "department",
                choices: depList,
                when: question => { return question.search === "Search Roles By Department"; }
            }
        ]).then(answers => {
            switch(answers.search){
                case "All Roles":
                    openingMenu.connection.query("SELECT title FROM roles", (err, data) => {
                        data.forEach(object => {
                            console.log(object.title);
                        });
                        viewData();
                    });
                    break;
                case "Search Roles By Department":
                    let idOfSearch = depIds[depList.indexOf(answers.department)];
                    openingMenu.connection.query("SELECT title FROM roles WHERE department_id = ?", [idOfSearch], (err, data) => {
                        data.forEach(object => {
                            console.log(object.title);
                        });
                        viewData();
                    });
                    break;
                case "Only Roles With A Deparment":
                    openingMenu.connection.query("SELECT title FROM roles WHERE department_id > 0", (err, data) => {
                        data.forEach(object => {
                            console.log(object.title);
                        });
                        viewData();
                    });
                    break;
            }
        });
    }) 
}

const viewEmployees = () => {
    getColumnFromTable("*", "roles").then(roleData => {
        var roleList = [];
        var roleIds = [];
        roleData.forEach(object => {
            roleList.push(object.title);
            roleIds.push(object.id);
        })

        openingMenu.connection.query(selfJoinQuery, (err, managers) => {
            var managerList = [];
            var managerIds = [];
            managers.forEach(object => {
                managerList.push(object.manager_firstName + " " + object.manager_lastName);
                managerIds.push(object.id);
            });
            inquirer.prompt([
                {
                    type: "list",
                    message: "What would you like to see?",
                    name: "search",
                    choices: ["All Employees", "Search Employees By Role", "Search Employees By Manager"]
                },
                {
                    type: "list",
                    message: "Select the Role",
                    name: "role",
                    choices: roleList,
                    when: questions => {
                        return questions.search == "Search Employees By Role";
                    }
                },
                {
                    type: "list",
                    message: "Select the Manager",
                    name: "manager",
                    choices: managerList,
                    when: questions => {
                        return questions.search == "Search Employees By Manager";
                    }
                },
                {
                    type: "list",
                    message: "How would you like the results ordered?",
                    name: "order",
                    choices: ["First Name, Ascending", "Last Name, Ascending", "First Name, Descending", "Last Name, Descending"]
                }
            ]).then(answers => {
                //concat to the query to order it
                let orderBy = "";
                switch(answers.order){
                    case "First Name, Ascending":
                        orderBy = " ORDER BY first_name ASC";
                        break;
                    case "Last Name, Ascending":
                        orderBy = " ORDER BY last_name ASC";
                        break;
                    case "First Name, Descending":
                        orderBy = " ORDER BY first_name DESC";
                        break;
                    case "Last Name, Descending":
                        orderBy = " ORDER BY last_name DESC";
                        break;
                }
    
                openingMenu.makeNewLine();
                console.log("EMPLOYEES:");
                switch(answers.search){
                    case "All Employees":
                        openingMenu.connection.query("SELECT * FROM employees" + orderBy, (err, data) => {
                            if(err) throw err;
                            data.forEach(object => {
                                console.log(object.first_name + " " + object.last_name);
                            })
                            viewData();
                        });
                        break;
                    case "Search Employees By Role":
                        openingMenu.connection.query("SELECT * FROM employees WHERE ?" + orderBy, { role_id: roleIds[roleList.indexOf(answers.role)]}, (err, data) => {
                            if(err) throw err;
                            data.forEach(object => {
                                console.log(object.first_name + " " + object.last_name);
                            })
                            viewData();
                        });
                        break;
                    case "Search Employees By Manager":
                        openingMenu.connection.query("SELECT * FROM employees WHERE ?" + orderBy, { manager_id: managerIds[managerList.indexOf(answers.manager)]}, (err, data) => {
                            if(err) throw err;
                            data.forEach(object => {
                                console.log(object.first_name + " " + object.last_name);
                            })
                            viewData();
                        });
                        break;
                }
            });
        });
    });
}

//accessed by updateDataEntries
module.exports.selfJoinQuery = selfJoinQuery;
module.exports.viewData = viewData;