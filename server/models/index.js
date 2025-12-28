const { sequelize } = require('../config/db');
const User = require('./User');
const Habit = require('./Habit');
const Mood = require('./Mood');
const HealthEntry = require('./HealthEntry');
const HabitLog = require('./HabitLog');
const FocusLog = require('./FocusLog');

// Associations
User.hasMany(Habit, { foreignKey: 'userId', onDelete: 'CASCADE' });
Habit.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Mood, { foreignKey: 'userId', onDelete: 'CASCADE' });
Mood.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(HealthEntry, { foreignKey: 'userId', onDelete: 'CASCADE' });
HealthEntry.belongsTo(User, { foreignKey: 'userId' });

Habit.hasMany(HabitLog, { foreignKey: 'habitId', onDelete: 'CASCADE' });
HabitLog.belongsTo(Habit, { foreignKey: 'habitId' });

User.hasMany(FocusLog, { foreignKey: 'userId', onDelete: 'CASCADE' });
FocusLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    sequelize,
    User,
    Habit,
    Mood,
    HealthEntry,
    HabitLog,
    FocusLog
};
