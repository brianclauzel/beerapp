'use strict'
module.exports = function(sequelize, Sequelize) {
    var User = sequelize.define("user", {
        id: {
            autoIncrement: true, 
            primaryKey: true, 
            type: Sequelize.INTEGER
        },
        firstName: {
            type: Sequelize.STRING,
            allowNull: true,
            validate: {
                len: [1,15]
            }
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: true,
            validate: {
                len: [1,15]
            }
        },
        username: {
            type: Sequelize.TEXT
        },
        email: {
            type: Sequelize.STRING,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: true
        },
        last_login: {
            type: Sequelize.DATE
        },
 
        status: {
            type: Sequelize.ENUM('active', 'inactive'),
            defaultValue: 'active'
        }
        
    });
    return User;
}