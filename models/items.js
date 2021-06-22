const sequelize = require('./../database/sequelize')
const Sequelize = require('sequelize');

module.exports = sequelize.define('items', {
    list_id: {
        field: 'list_id',
        type: Sequelize.INTEGER
    },
    itemName: {
        field: 'itemName',
        type: Sequelize.STRING
    },
    itemFinished: {
        field: 'itemFinished',
        type: Sequelize.BOOLEAN
    }
}, {
    timestamps: false
});