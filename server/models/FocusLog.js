const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FocusLog = sequelize.define('FocusLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    duration: {
        type: DataTypes.INTEGER, // in minutes
        allowNull: false
    },
    completedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = FocusLog;
