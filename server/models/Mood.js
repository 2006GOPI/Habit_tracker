const { DataTypes, sequelize } = require('../config/db');

const Mood = sequelize.define('Mood', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    mood_score: {
        type: DataTypes.INTEGER, // 1 to 5 (Sad to Happy)
        allowNull: false
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Mood;
