var mysql = require('mysql');

var pool = mysql.createPool({
  host : 'localhost',
  user : 'root',
  password : '@Yash1234',
  database : 'e_commerce'
})

module.exports = pool;
