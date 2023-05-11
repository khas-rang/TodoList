

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose= require("mongoose");
require('dotenv').config();
mongoose.connect("mongodb+srv://"+ process.env.UNAME +":"+ process.env.PWORD +"@cluster01.oxgxx4l.mongodb.net/NewDataB");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const _=require("lodash");




const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required:true
    }
});

const Item = mongoose.model("item", itemSchema);

const newitem1= new Item({
  name: "Hey Khas."
});
const newitem2= new Item({
  name: "Welcome to Your ToDo lists."
});
const newitem3= new Item({
  name: "Type something to Add."
});

const defaulitems=[newitem1,newitem2,newitem3];

const listSchema = new mongoose.Schema({
  name: String,
  items:[itemSchema]
})
const List = new mongoose.model("list",listSchema);


app.get("/", function(req, res) {
  Item.find()
  .then(function(founditem){
          if(founditem.length===0){
            Item.insertMany(defaulitems)
        .then(function(){
          console.log("successfully added");
        })
        .catch(function(err){
          console.log(err);
        });
    }
    const day = date.getDate();
    res.render("list", {listTitle: "Today", newListItems: founditem, newList_title:"Today",thelistname: "Today"});  
  })
  .catch(function(err){
    console.log(err);
  })
  });


app.post("/", function(req, res){
  const itemName = req.body.newItem;
  //const newlistName= req.body.list;
  const thetitle = req.body.list;
  if(thetitle==="Today"){
    const newLyWroteItem = new Item({name:itemName});
    newLyWroteItem.save();
    res.redirect("/");
  }else{
  List.findOneAndUpdate({ name:thetitle },{ $push: { items:{name: itemName}} })
    .then(function(){
    //
    })
    .catch(function(err){
      console.log(err);
    });
    res.redirect("/"+thetitle);
  }
});


app.post("/delete",function(req,res){
  const checkeditemID= req.body.checkbox;
  const liName= req.body.listname;
  if(liName==="Today"){
          Item.deleteOne({_id:checkeditemID})
      .then(function(){
        //console.log("successfully deleted "+ checkeditemID );  
      })
      .catch(function(err){
        console.log(err);
      });
      res.redirect("/");
  }else{
    List.findOneAndUpdate({name: liName},{ $pull: {items:{ _id: checkeditemID} }})
    .then(function(){
      //console.log("successfully deleted "+ checkeditemID );   
      res.redirect("/" + liName);
    })
    .catch(function(err){
      console.log(err);
    });
  }  
 });


app.get("/:path",function(req,res){
  const path= _.lowerCase(req.params.path); 
  List.findOne({name: path})
  .then(function(foundlist){
    if(foundlist!=null){
      //show th list 
      res.render("list", {listTitle: path, newListItems: foundlist.items, newList_title:path, thelistname: path});
    }else{
      console.log("not found");
      //add the list 
      const newli= new List({name:path, items:[newitem2,newitem3]});
      newli.save();
      res.redirect("/"+path);
    }
  })
  .catch(function(err){
    console.log(err);
  })
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
