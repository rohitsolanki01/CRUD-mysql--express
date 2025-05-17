const { faker, da, tr } = require('@faker-js/faker');
const mysql = require("mysql2");
const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const {v4 : uuid} = require("uuid");

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname , "public")));
app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rohitsolanki',
    database: 'users_db',
});

let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.username(),
        faker.internet.email(),
        faker.internet.password(),
    ];
}

app.get("/" , (req,res) => {
    q = "SELECT  COUNT(*) FROM user";
    try{
        connection.query(q,(err,result) => {
            if(err) throw err;
            console.log(result);
            let user = result[0]['COUNT(*)'];
         res.render("home.ejs" , {user})
        })
    }catch(err){
        console.log(err);
    }
})
app.get("/user" , (req,res) => {
    q = `SELECT * FROM user`;
    try{
        connection.query(q,(err,result) => {
            if(err) throw err;
          
            res.render("showusers.ejs" , {result});
        })
    }catch(err){
        console.log(err);

    }
});

app.get("/user/:id/edit" , (req,res) => {
    let { id } = req.params;
    q = `SELECT * FROM user where id ='${id}'`;
    try{
        connection.query(q,(err,result) => {
            if(err) throw err;
            let user = result[0];
            res.render("edit.ejs" , {user})
        })
    }catch(err){
        console.log(err);

    }
})

app.patch("/user/:id" , (req,res) => {
    let { id } = req.params;
   let {username: formUserName , password :formPassword} = req.body;
   q = `SELECT * FROM user where id ='${id}'`;
try{
    connection.query(q,(err,result) => {
        if(err) throw err;
        let user = result[0];
        if(formPassword != user.password){
            res.send("password is wrong");
        }
        else{
            let q2 = `UPDATE user SET username = '${formUserName}' where id ='${id}'`
            connection.query(q2 , (req,result) => {
                if(err) throw err;
                res.redirect("/user");
            })
        }
    })
}catch(err){
    console.log(err);
    
}
});


app.post("/user" , (req,res) => {
    let id = uuid();
    let {username , email , password} = req.body;
    let q = `INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)`; 
    try{
        connection.query(q, [id, username, email, password], (err, result) => {
            if (err) {
              console.error("Database error:", err);
              return res.send("Failed to insert user");
            }
            console.log("Inserted user:", username);
            res.redirect("/user");
          });
    }catch(err) {
        console.log(err);
        
    }
})

app.get("/user/:id/delete" , (req,res) => {
    let { id } = req.params;
    q = `SELECT * FROM user where id ='${id}'`;
    try{
        connection.query(q,(err,result) => {
            if(err) throw err;
            let user = result[0];
            res.render("delete.ejs" , {user})
        })
    }catch(err){
        console.log(err);

    }
});
app.delete("/user/:id" , (req,res) => {
    let { id } = req.params;
    let { password } = req.body; 
    let q1 = `SELECT password FROM user WHERE id = '${id}'`; 
    try{
        connection.query(q1, (err, result) => {
            if(err) throw err;
            if(result.length === 0){
                return res.send("user not found"); 
            }
            let storedPassword = result[0].password;
            if(password == storedPassword){ 
                let q2 = `DELETE FROM user WHERE id = '${id}'`;
                connection.query(q2, (err, result) => {
                    if(err) throw err;
                    res.redirect("/user");
                });
            } else {
                res.send("password is wrong"); 
            }
        });
    }catch(err){
        console.log(err);
        res.send("An error occurred during deletion"); 
    }
});


app.listen(port , () => {
    console.log(`app is lisnning on ${port}`);
})

