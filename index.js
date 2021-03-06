const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const passportJWT = require('./config/passport-jwt-strategy');
const passportGoogle = require('./config/passport-google-strategy');
const MongoStore = require('connect-mongo')(session);
const sassMiddleware = require('node-sass-middleware');
const flash = require('connect-flash');
const customMware = require('./config/middleware');
const env = require('./config/environment');
const logger = require('morgan');

const port = 3000;
const app = express();
require('./config/view_helpers')(app);

const chatServer = require('http').createServer(app);
const chatSockets = require('./config/chat_sockets').chatSockets(chatServer);

chatServer.listen(5000, function(err){
    if(err){
        console.log('Error in starting chat server on port 5000', err);
        return;
    }
    console.log('Chat Server is running on 5000');
});

app.use(logger(env.morgan.mode, env.morgan.options));

//Setup the sass middleware to precompile the scss files to css files
// Note: you must place sass-middleware *before* `express.static` or else it will not work.
if(env.name == 'development'){
    app.use(sassMiddleware({
        src: path.join(__dirname, env.assets_path, 'scss'),
        dest: path.join(__dirname, env.assets_path, 'css'),
        debug: true,
        outputStyle: 'expanded',
        prefix: '/css' // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
    }));
    
}

//Parse the post requests
app.use(express.urlencoded({ extended: true }));

//Parse the cookie received with every request
app.use(cookieParser());

//setup static files access
app.use(express.static(path.join(__dirname, env.assets_path)));

// Redirecting requests on uploads to uploads folder
app.use('/uploads', express.static('./uploads'));

// extract styles and script tags from sub-pages into layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);


// use express ejs layouts
app.use(expressLayouts);


// set up the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


//Setup the express-session to encrypt the key
app.use(session({
    name: 'Codeial',
    secret: env.session_secret_key,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000*60*100),
    },
    store: new MongoStore({
        mongooseConnection: db,
        autoRemove: 'disabled'
    }, function(err){
        console.log(err || 'Connect Mongodb setup ok');
    })
}));

//Tell app to use passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Setup express to use connect-flash 
app.use(flash());
app.use(customMware.setFlash);


app.use(passport.setAuthenticatedUser);

//use the routes for handling requests 
app.use('/', require('./routes/index'));

 
app.listen(port, function(err){
    if(err){
        console.log('Error occurred while firing up the server.');
        return;
    }
    console.log('Server is up and running on port :', port);
    return;
});