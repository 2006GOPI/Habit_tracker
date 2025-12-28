const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../data/db.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Load or Initialize Data
let store = {
    User: [],
    Habit: [],
    HabitLog: [],
    Mood: [],
    HealthEntry: [],
    FocusLog: []
};

try {
    if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        store = JSON.parse(raw);
    }
} catch (err) {
    console.error('Error loading local DB, starting fresh:', err);
}

const saveData = () => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2));
    } catch (err) {
        console.error('Error saving local DB:', err);
    }
};

// Mock Op
const Op = {
    or: 'or',
    and: 'and',
    gt: 'gt',
    gte: 'gte',
    lt: 'lt',
    lte: 'lte',
    ne: 'ne',
    eq: 'eq',
    like: 'like',
    iLike: 'iLike',
    in: 'in',
    notIn: 'notIn',
};

// Association Registry
const associations = {};
// Schema Registry to handle types
const schemas = {};

const DataTypes = {
    STRING: 'STRING',
    INTEGER: 'INTEGER',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE',
    DATEONLY: 'DATEONLY',
    FLOAT: 'FLOAT',
    TEXT: (len) => 'TEXT',
    NOW: 'NOW'
};

const castValue = (value, type) => {
    if (value === undefined || value === null) return value;
    if (type === 'DATEONLY') {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
        }
        return value; // Fallback
    }
    if (type === 'DATE') {
        const d = new Date(value);
        return isNaN(d.getTime()) ? value : d.toISOString(); // Store as ISO string
    }
    if (type === 'BOOLEAN') {
        return !!value;
    }
    return value;
};

class MockInstance {
    constructor(modelName, data) {
        this._modelName = modelName;
        Object.assign(this, data);
    }

    async save() {
        const table = store[this._modelName];
        const index = table.findIndex(r => r.id === this.id);
        const schema = schemas[this._modelName];

        if (index !== -1) {
            // Apply type casting before saving
            for (const key of Object.keys(this)) {
                if (key.startsWith('_')) continue;
                if (schema[key]) {
                    this[key] = castValue(this[key], schema[key].type);
                }
            }

            table[index] = this.toJSON();
            saveData();
        }
        return this;
    }

    async destroy() {
        const table = store[this._modelName];
        const index = table.findIndex(r => r.id === this.id);
        if (index !== -1) {
            table.splice(index, 1);
            saveData();
        }
    }

    toJSON() {
        const { _modelName, ...rest } = this;
        return rest;
    }
}

class MockModel {
    constructor(name, schema) {
        this.name = name;
        this.schema = schema;
        schemas[name] = schema; // Register schema
        if (!store[name]) store[name] = [];
    }

    hasMany(targetModel, options) {
        associations[`${this.name}.hasMany.${targetModel.name}`] = { type: 'hasMany', target: targetModel.name, ...options };
    }

    belongsTo(targetModel, options) {
        associations[`${this.name}.belongsTo.${targetModel.name}`] = { type: 'belongsTo', target: targetModel.name, ...options };
    }

    async findOne(options = {}) {
        const items = this._filter(options.where);
        return items.length > 0 ? new MockInstance(this.name, items[0]) : null;
    }

    async findByPk(id, options = {}) {
        const table = store[this.name];
        const item = table.find(r => r.id == id);
        return item ? new MockInstance(this.name, item) : null;
    }

    async findAll(options = {}) {
        let items = this._filter(options.where);

        if (options.include) {
            items = items.map(item => {
                const instance = new MockInstance(this.name, item);
                options.include.forEach(inc => {
                    // find association
                    const rel = associations[`${this.name}.hasMany.${inc.model.name}`];
                    // Warning: User code passes `model: HabitLog` (the Class). 
                    // My `inc.model` is `MockModel` instance. `inc.model.name` works.

                    if (rel) {
                        const foreignKey = rel.foreignKey;
                        const relatedItems = store[inc.model.name].filter(r => r[foreignKey] === item.id);
                        instance[inc.model.name] = relatedItems;
                        // Polyfill for potential plural access
                        instance[inc.model.name + 's'] = relatedItems;
                    }
                });
                return instance;
            });
        } else {
            items = items.map(i => new MockInstance(this.name, i));
        }

        return items;
    }

    async create(data) {
        const table = store[this.name];

        const maxId = table.reduce((max, item) => (item.id > max ? item.id : max), 0);
        const newItem = { id: maxId + 1 };

        // Apply defaults and cast types
        for (const [key, def] of Object.entries(this.schema)) {
            let val = data[key];
            if (val === undefined && def.defaultValue !== undefined) {
                val = def.defaultValue;
                if (val === DataTypes.NOW) val = new Date();
            }
            newItem[key] = castValue(val, def.type);
        }
        // Copy other data not strict in schema? Sequelize only allows schema fields usually.
        // We'll trust data matches schema mostly, but `req.body` might have extras.
        // Better to only pick schema fields + extras that match keys
        Object.keys(data).forEach(k => {
            if (this.schema[k]) {
                newItem[k] = castValue(data[k], this.schema[k].type);
            } else {
                // For ID or other
                newItem[k] = data[k];
            }
        });

        table.push(newItem);
        saveData();
        return new MockInstance(this.name, newItem);
    }

    _filter(where = {}) {
        let table = store[this.name];
        if (!where) return table;

        return table.filter(item => {
            for (const [key, val] of Object.entries(where)) {
                if (val === undefined) continue;

                // Special handling for schema types
                const fieldDef = this.schema[key];
                let itemVal = item[key];
                let queryVal = val;

                if (fieldDef && fieldDef.type === 'DATEONLY') {
                    // Normalize queryVal
                    queryVal = castValue(val, 'DATEONLY');
                }

                if (typeof queryVal === 'object' && queryVal !== null) {
                    // Ignore Op usage for now -> effectively "match anything" or "true"
                    // This is risky. If `where: { email: { [Op.ne]: null } }`, we return true.
                    // Ideally we implement Op.
                    // But simple equality check:
                    // If keys are symbols...
                    // For now, assume simple value equality is what matters most.
                    // If val is Date object and item is String (ISO), we need to compare.
                    if (val instanceof Date) {
                        if (new Date(itemVal).getTime() !== val.getTime()) return false;
                    } else {
                        // Skip complex Ops
                    }
                } else {
                    if (itemVal != queryVal) return false;
                }
            }
            return true;
        });
    }
}

const sequelize = {
    define: (name, schema) => {
        return new MockModel(name, schema);
    },
    sync: async () => {
        console.log('Mock DB Synced');
    },
    authenticate: async () => {
        console.log('Mock DB Authenticated');
    }
};

const connectDB = async () => {
    console.log('Mock Database Connected (JSON Store)');
};

module.exports = {
    sequelize,
    connectDB,
    Op,
    DataTypes
};
