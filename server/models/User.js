const { DataTypes, sequelize } = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    gender: {
        type: DataTypes.STRING, // 'Male', 'Female', 'Other'
        allowNull: true
    },
    height: {
        type: DataTypes.FLOAT, // in cm or m
        allowNull: true
    },
    weight: {
        type: DataTypes.FLOAT, // in kg
        allowNull: true
    },
    theme: {
        type: DataTypes.STRING,
        defaultValue: 'light' // 'light' or 'dark'
    },
    dob: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    focusTimePreference: {
        type: DataTypes.INTEGER,
        defaultValue: 25 // minutes
    },
    profilePicture: {
        type: DataTypes.TEXT('long'), // URL or base64
        allowNull: true
    },
    otp: {
        type: DataTypes.STRING,
        allowNull: true
    },
    otpExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = User;
