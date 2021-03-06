var bCrypt = require('bcrypt-nodejs');

//INITIALIZE PASSPORT-LOCAL STRATEGY AND USER MODEL
module.exports = function (passport, user) {
    var User = user;
    var LocalStrategy = require('passport-local').Strategy;
    //Passport uses serialize to save user id to session to manage retrieving user details when needed
    //serialize
    passport.serializeUser(function (user, done) {
        done(null, user.id);
        
        //console.log(session.passport.user);
    })
    //deserialize user
    passport.deserializeUser(function (id, done) {
        //using sequelize findByID promise to get user 
        User.findById(id).then(function (user) {
            //if successful, instance of model returned
            if (user) {
                //sequelize getter function is used to get user object from instance
                done(null,user.get());
            }
            else {
                done(user.errors, null);
            }
        });
    });


    passport.use('local-signup', new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back entire request to callback
        },
        //CALLBACK FUNCTION TO ENCRYPT PASSWORD
        function (req, email, password, done) {
            var generateHash = function (password) {
                return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
            };
            //CHECKS IF USER ALREADY EXISTS
            User.findOne({
                where: {
                    email: email
                }
            }).then(function(user) {
                //If user already exists message, the email has been used and return
                if (user) {
                    console.log("The email is already taken");
                    return done(null, false, {
                        message: 'That email is already taken'
                    });
                } else {
                    //else encrypt password 
                    var userPassword = generateHash(password);
                    var data =
                        {
                            email: email,
                            password: userPassword,
                            firstName: req.body.firstname,
                            lastName: req.body.lastname
                        };
                    //User.create()= sequelize method for adding entries to database
                    //objects are req.body objects which are inputs received from signup form
                    User.create(data).then(function (newUser, created) {
                        if (!newUser) {
                            return done(null, false);
                        }
                        if (newUser) {
                            return done(null, newUser);
                        }
                    });
                }
            });
        }


    ));
    //LOCAL SIGNIN
    passport.use('local-signin', new LocalStrategy(
        {
            //local strategy uses username and password. Overriding with email 
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true //allows passing back entire request to callback
        },
        function (req, email, password, done) {
            var User = user;
            //creating a validation function for the password
            var isValidPassword = function (userpass, password) {
                return bCrypt.compareSync(password, userpass);
            }
            //searching database if email account matches a registered user
            User.findOne({
                where: {
                    email: email
                }
            }).then(function (user) {
                //if no user exists return message with string
                if (!user) {
                    return done(null, false, {
                        message: 'Email does not exist'
                    });
                }
                //if user password does not match password then return message with string
                //bcrypt comparison method is used since password is stored with bcrypt
                if (!isValidPassword(user.password, password)) {
                    return done(null, false, {
                        message: 'Incorrect password.'
                    });
                }
                var userinfo = user.get();
                console.log("####################################################################################################################################################################################################this is the userinfo" + user.id);
                return done(null, userinfo);
    
            }).catch(function (err) {
                console.log("Error:", err);
                return done(null, false, {
                    message: 'Something went wrong with your Signin'
                });
            });

        }
    ))
}