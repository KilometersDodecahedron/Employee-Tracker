const inquirer = require("inquirer");
const mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "wJfGSO1F0hzx",
    database: "greatBay_DB"
});

//for the FOREIGN KEYS (FK) load the data, and generate the options from the saved data