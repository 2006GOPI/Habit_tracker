const { DataTypes, sequelize } = require('../config/db');

const HealthEntry = sequelize.define('HealthEntry', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    bp_systolic: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    bp_diastolic: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    bmi: {
        type: DataTypes.FLOAT, // store BMI value
        allowNull: true
    },
    status: {
        type: DataTypes.STRING, // store BMI Status text
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

module.exports = HealthEntry;
