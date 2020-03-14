var mysql = require("mysql");

var inquirer = require("inquirer")

var connection = mysql.createConnection({
    host: "localhost",
    // Your port; if not 3306
    port: 3306,
    // Your username
    user: "root",
    // Your password
    password: pass,
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    showItems();
});

function showItems() {
    console.log("Displaying all items...\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log("ID: " + res[i].item_id)
            console.log("Name of Product: " + res[i].product_name)
            console.log("Department : " + res[i].department_name)
            console.log("Price: " + "$" + res[i].price)
            console.log("Amount in stock: " + res[i].stock_quantity)
            console.log('===================');
        }
        userPurchase()
    });
}

function userPurchase() {

    inquirer.prompt([
        {
            name: "item_id",
            type: "input",
            message: "Enter the item ID that you would like to purchase."
        },
        {
            name: "quantity",
            type: "input",
            message: "How many would you like to purchase?"
        }
    ]).then(function (answer) {
        var queryStr = 'SELECT * FROM products WHERE ?';

        connection.query(queryStr, { item_id: answer.item_id }, function (err, data) {
            if (err) throw err;

            var quantity = answer.quantity;
            // var that holds data of selected item for use throughout this function
            var itemInfo = data[0];

            // if the data reponse is empty then that means the user enter an ID that doesn't exist
            // so we show them the items again and let them choose another item.
            if (itemInfo.length === 0) {
                console.log('Error: Product does not exist. Please select a valid Product ID.');
                showItems();
            } else {
                if (quantity <= itemInfo.stock_quantity) {
                    var updateItem = 'UPDATE products SET stock_quantity = ' + (itemInfo.stock_quantity - quantity) + ' WHERE item_id = ' + answer.item_id;

                    connection.query(updateItem, function (err, data) {
                        if (err) throw err
                        console.log("Your total amount spent is $" + itemInfo.price * quantity)
                        connection.end();
                    })
                } else {
                    console.log("Unfortunately, we do not have enough of that product in stock, please try a different product.")
                    showItems()
                }
            }
        })
    })
}



