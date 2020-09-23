const addData = require("./addDataEntries");
const viewData = require("./viewDataEntries");
const updateData = require("./updateDataEntries");

const inquirer = require("inquirer");
const mysql = require("mysql");

//make sure the welcome message only plays at the start
var loaded = false;

//put in a new line by adding this as a template literal
const newLine = `\n-------------------------------`;

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "wJfGSO1F0hzx",
    database: "employeeTracker_DB"
});

//easy way to separate lines, without having to worry about reformatting the text for template literals
const makeNewLine = () => {
    console.log(newLine);
}

//run when a connection needs to end
const endConnection = () => {
    makeNewLine();
    console.log("Thank you for using Golden Child Employee Tracker! \nIf you'd like to run the program again, simply run\nnode index.js\nIn the program's directory\n-------------------------------");
    connection.end();
}

//for the FOREIGN KEYS (FK) load the data, and generate the options from the saved data

//run at the start, and after each action is complete to return to the opening menu
const openingMenu = () => {
    makeNewLine();

    //prints a welcome message when the program starts
    if(!loaded){
        console.log(`Welcome to the Golden Child Employee Tracker!`);
        makeNewLine();
        loaded = true;
    }
    
    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "action",
            choices: ["View Existing Entries", "Enter New Information", "Update Employee Roles", "Exit Golden Child Employee Tracker"]
        }
    ]).then(answer => {
        console.log(answer.action);
        switch(answer.action){
            case "View Existing Entries":
                viewData.viewData();
                break;
            case "Enter New Information":
                addData.addData();
                break;
            case "Update Employee Roles":
                //TODO
                updateData.updateData();
                break;
            case "Exit Golden Child Employee Tracker":
                endConnection();
                break;
            default:
                console.log("ERROR: openingMenu() is breaking switch statement");
                connection.end();
        }
    });
}

//lets other scripts navigate back to the start menu
module.exports.openingMenu = openingMenu;
//this is just a useful formatting tool
module.exports.makeNewLine = makeNewLine;
//allow other scripts to access the server
module.exports.connection = connection;

connection.connect(function(err) {
    if (err) throw err;
    // make sure it's using the right database
    connection.query("USE employeeTracker_DB", (err) => {
        if (err) throw err;
        openingMenu();
    }); 
});

