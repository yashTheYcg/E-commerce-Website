var express = require("express");
const ejs = require("ejs");
var bodyParser = require("body-parser");
var con = require("./connection");
var app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


// declaring variables
var person;
var email;
var supply_id;
var quantity;
let currentQty;
var customer_id;

// navigating through the pages in html
app.get('/', function(req, res){
  res.render("login");

})
app.get('/signup', function(req, res){
  res.render("signup");
})

app.get('/login', function(req, res){
  res.render("login");
})

app.get('/home', function(req, res){


  var sql5 = "Select * from item";
  con.query(sql5,function(err, result) {
    if(err){
      console.log(err);
    } else {
      // console.log(result);
      res.render("home", {item: result, person:person} );
    }
  })

})

app.get('/profile', function(req, res){

  var sql1 = "Select * from " + person + " where email = ?";
  con.query(sql1,[email],function(err, result) {
    if(err){
      console.log(err);
    } else {
      // console.log(result);
      res.render("profile", {info: result, person:person} );
    }
  })
})

app.get('/sellProduct', function(req, res){
  var sql9 = "Select * from item where supplier_id = "+ supply_id;
  con.query(sql9, function(err, result) {
    if(err) {
      console.log(err);
    } else {
      res.render("sellProduct",{items:result});
    }
  })
})

app.get('/buy', function(req, res) {

  res.render("buy",{person:person});
})




// now getting the post request from the pages
app.post("/signup", function(req, res){

  person = req.body.person;
  var fname = req.body.fname;
  var lname = req.body.lname;
  var street_name = req.body.street_name;
  var street_number = req.body.street_number;
  var city = req.body.city;
  var pincode = req.body.pincode;
  var state = req.body.state;
  var phone_number = req.body.phone_number;
  email = req.body.email;
  var account_id = req.body.account_id;
  var password = req.body.password;

  con.getConnection(function(error){
    if(error) throw error;

    var sql0 = "Select * from " + person + " where email = ?";
    con.query(sql0,[email],function(err, check) {
      if(err){
        console.log(err);
      } else {
          if(check.length===0){
            var sql = "INSERT INTO "+ person +" (first_name, last_name, street_name, street_number, city, pincode, state, phone_number, email, account_id,password) VALUES(?,?,?,?,?,?,?,?,?,?,?)";
            con.query(sql,[fname,lname,street_name,street_number,city,pincode,state,phone_number,email,account_id,password], function(error, result){
              if(error) throw error;

              if(person === "seller"){
                supply_id = check[0].seller_id;
              } else {
                customer_id = check[0].customer_id;
              }

              res.render("loggedIn",{person:person});
            });
          } else {
            res.render("signupFailure");
          }
      }
    })
  })
})

app.post("/profile", function(req, res){

  var sql = "DELETE from "+person+" where "+person+"_id = " + req.body.id;
  con.query(sql,function(err, result){
    if(err){
      console.log(err.message);
    } else {
      res.redirect("/login");
    }
  });
});


app.post("/login", function(req, res){
  email = req.body.Email;
  var password = req.body.Password;
  person = req.body.person;

  // console.log(email +" "+ password + " " + person);
  var sql = "Select * from " + person + " where email = ? AND password = ?" ;
  con.query(sql,[email,password],function(err, result){
        if(err) {
          console.log(err.message);
        } else {
          if(result.length===0) {
            // console.log(result);
            res.render("failure");

          } else {
            // console.log(result);
            if(person === "seller"){
              supply_id = result[0].seller_id;
            } else {
              customer_id = result[0].customer_id;
            }


            res.render("success",{person:person});
          }
        }
      });
})

app.post("/deleteItem", function(req, res) {
  // console.log("item ID : " + req.body.id);

  var sql6 = "DELETE from item where item_id = " + req.body.id;
  con.query(sql6,function(err, result){
    if(err){
      console.log(err.message);
    } else {
      res.redirect("/sellProduct");
    }
  });

})

app.post("/sellProduct", function (req, res) {

  var itemName = req.body.item_name;
  var companyName = req.body.company_name;
  var price = req.body.price;
  var discount = req.body.discount;
  quantity = req.body.stock_quantity;
  var size = req.body.size;
  var weight = req.body.weight;
  var color = req.body.color;
  var material = req.body.material;

  con.getConnection(function(error){
    if(error) throw error;

    var sql2 = "Select * from item where item_name = ? AND color = ?";
    con.query(sql2,[itemName, color], function (err, check){
      if(err){
        console.log(err);
      } else {
        if(check.length === 0){

          var sql4 = "INSERT INTO item (item_name,supplier_id,company_name,price,discount,stock_quantity,size,weight,color,material) VALUES(?,?,?,?,?,?,?,?,?,?)";
          con.query(sql4, [itemName,supply_id,companyName,price,discount,quantity,size,weight,color,material], function(err, result){
            if(err){
              console.log(err);
            } else {
              var sql9 = "Select * from item where supplier_id = "+ supply_id;
              con.query(sql9, function(err, result) {
                if(err) {
                  console.log(err);
                } else {
                  res.render("sellProduct",{items:result});
                }
              })
            }
          })

        } else {
          res.render("productAddedFailure");
        }
      }
    })

  })
})

app.post("/home", function(req, res){



    // console.log(date);

    var sql7 = "Select * from item where item_id = " + req.body.id;
    con.query(sql7,function(err, result){
      if(err){
        console.log(err);
      } else {

        quantity = result[0].stock_quantity;
        res.render("buy",{item:result, person:person});
      }
    })

});


app.post("/buy", function(req, res){

  // console.log(req.body.quantity + " " + req.body.id);
  currentQty = quantity - req.body.quantity;
  // console.log(currentQty);

  var sql8 = "Update item Set stock_quantity = "+currentQty+" where item_id = "+req.body.id;
  con.query(sql8, function(err, result){
    if(err){
      console.log(err);
    } else {
      // console.log(result);

      var sql10 = "Select * from item where item_id = "+ req.body.id;

      con.query(sql10,function(error0, result0) {
        if(error0) {
          console.log(err.message);
        } else {

          var totalPrice = (result0[0].price * req.body.quantity);
          var dateTime = "2022-05-04";

          // console.log(totalPrice);
          var sql11 = "INSERT INTO buys(item_id,customer_id,quantity_bought,order_date_time,total_price) VALUES(?,?,?,?,?)";
          con.query(sql11,[result0[0].item_id,customer_id,req.body.quantity,dateTime,totalPrice+150],function(error1, result1) {
            if(error1) {
              console.log(error1.message);
            } else {

              res.render("checkout",{person:person, item: result0, totalprice: totalPrice, quantity:req.body.quantity});
            }
          })

        }
      })
    }
  })



})

// creating the server
app.listen(3000, function(){
  console.log("Server is running at : 3000");
  con.getConnection(function(err){
    if(err) throw err;

    console.log("Database Connected");
  })
});
