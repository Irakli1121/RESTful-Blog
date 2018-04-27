var express             = require('express'),
    app                 = express(),
    bodyParser          = require('body-parser'),
    methodOverride      = require('method-override'),
    expressSanitizer    = require('express-sanitizer'),
    mongoose            = require('mongoose');


//app config
mongoose.connect('mongodb://localhost/restful_blog_app');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
//sanitizer should be after body parser!
app.use(expressSanitizer());
app.use(methodOverride("_method"));


// mongoose/model config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);


//RESTful routes

app.get('/', function(req,res){
    res.redirect('/blogs');
})

app.get('/blogs', function (req,res){
    Blog.find({}, function (err, blogs){
        if (err){
            console.log('An error has occured!');
        } else {
            res.render('index', {blogs: blogs});
        }
    });
});

// NEW route
app.get("/blogs/new", function (req,res){
    res.render('new');
});

//CREATE route
app.post("/blogs", function(req,res){
    //sanitize input to avoid <script> tags from user
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //create blog
    Blog.create(req.body.blog, function (err, newBlog){
        if (err){
            res.render('new');
        } else {
        //redirect to the index
            res.redirect('/blogs');
        }
    });
});

//SHOW route
app.get("/blogs/:id", function (req,res){
    Blog.findById(req.params.id, function (err, foundBlog){
        if (err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});

//EDIT route
app.get("/blogs/:id/edit", function (req,res){
    Blog.findById(req.params.id, function (err, foundBlog){
        if (err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
    
});

//Update Route
app.put("/blogs/:id", function(req,res){
    //sanitize input to avoid <script> tags from user
    req.body.blog.body = req.sanitize(req.body.blog.body);
    
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function (err, updatedBlog){
        if (err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//DELETE Route

app.delete("/blogs/:id", function (req,res){
    //destroy
    Blog.findByIdAndRemove(req.params.id, function(err){
        if (err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

app.listen(3000, function (){
    console.log('Server is running!');
});