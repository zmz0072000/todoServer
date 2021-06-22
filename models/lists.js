const sequelize = require('./../database/sequelize')
const Sequelize = require('sequelize');

module.exports = sequelize.define('lists', {
    listName: {
        field: 'listName',
        type: Sequelize.STRING
    }
}, {
    timestamps: false
});