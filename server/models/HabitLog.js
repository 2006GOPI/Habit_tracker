const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const HabitLog = sequelize.define('HabitLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    habitId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = HabitLog;
