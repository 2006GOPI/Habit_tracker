const { DataTypes, sequelize } = require('../config/db');

const Habit = sequelize.define('Habit', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING, // 'Fitness', 'Learning', 'Health'
        defaultValue: 'General'
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Habit;
