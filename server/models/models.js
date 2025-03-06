const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id_user: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    lastname: { type: DataTypes.STRING, allowNull: false },
    firstname: { type: DataTypes.STRING, allowNull: false },
    middlename: { type: DataTypes.STRING },
    last_login: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    role_name: { type: DataTypes.STRING, allowNull: false },
    is_blocked: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const Admin = sequelize.define('admin', {
    id_admin: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    lastname: { type: DataTypes.STRING, allowNull: false },
    firstname: { type: DataTypes.STRING, allowNull: false },
    middlename: { type: DataTypes.STRING },
    last_login: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const Blacklist = sequelize.define('blacklist', {
    id_blacklist: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    reason: { type: DataTypes.TEXT }
});

// Связь с User
Blacklist.belongsTo(User, { foreignKey: 'id_user' });
User.hasMany(Blacklist, { foreignKey: 'id_user' });

const Group = sequelize.define('group', {
    id_group: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    group_number: { type: DataTypes.STRING, allowNull: false },
    hash_code_login: { type: DataTypes.STRING, allowNull: false }
});

// Связь с User
Group.belongsTo(User, { foreignKey: 'id_user' });
User.hasMany(Group, { foreignKey: 'id_user' });

const UsersInGroup = sequelize.define('users_in_group', {
    id_users_group: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
});

// Связь с User и Group
UsersInGroup.belongsTo(User, { foreignKey: 'id_user' });
UsersInGroup.belongsTo(Group, { foreignKey: 'id_group' });
User.hasMany(UsersInGroup, { foreignKey: 'id_user' });
Group.hasMany(UsersInGroup, { foreignKey: 'id_group' });

const Task = sequelize.define('task', {
    id_task: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    task_name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
});

const TaskForGroup = sequelize.define('task_for_group', {
    id_task_for_group: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    is_open: { type: DataTypes.BOOLEAN, allowNull: false },
    deadline: { type: DataTypes.DATE }
});

// Связь с Group и Task
TaskForGroup.belongsTo(Group, { foreignKey: 'id_group' });
TaskForGroup.belongsTo(Task, { foreignKey: 'id_task' });
Group.hasMany(TaskForGroup, { foreignKey: 'id_group' });
Task.hasMany(TaskForGroup, { foreignKey: 'id_task' });

const UserMakeTask = sequelize.define('user_make_task', {
    id_result: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    score: { type: DataTypes.INTEGER },
    comment_user: { type: DataTypes.TEXT },
    comment_teacher: { type: DataTypes.TEXT },
    date_start: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    date_finish: { type: DataTypes.DATE },
    is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    deleted_by: { type: DataTypes.INTEGER }
});

// Связь с User и Task
UserMakeTask.belongsTo(User, { foreignKey: 'id_user' });
UserMakeTask.belongsTo(Task, { foreignKey: 'id_task' });
User.hasMany(UserMakeTask, { foreignKey: 'id_user' });
Task.hasMany(UserMakeTask, { foreignKey: 'id_task' });

module.exports = {
    User,
    Admin,
    Blacklist,
    Group,
    UsersInGroup,
    Task,
    TaskForGroup,
    UserMakeTask
};