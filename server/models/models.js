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
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    lastname: { type: DataTypes.STRING, allowNull: false },
    firstname: { type: DataTypes.STRING, allowNull: false },
    middlename: { type: DataTypes.STRING },
    last_login: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// Хук для создания начальной записи администратора
Admin.afterSync(async () => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD; // Хешированный пароль

    const existingAdmin = await Admin.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
        await Admin.create({
            email: adminEmail,
            password: adminPassword,
            lastname: 'admin',
            firstname: 'admin',
            last_login: new Date(),
            is_active: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('Начальная запись администратора создана.');
    } else {
        console.log('Начальная запись администратора уже существует.');
    }
});

const Support = sequelize.define('support', {
    id_support: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_admin: { type: DataTypes.INTEGER, allowNull: false },
    id_user: { type: DataTypes.INTEGER },
    user_text: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING },
    admin_response: { type: DataTypes.TEXT }
});

// Связь с Group и Task
Support.belongsTo(Admin, { foreignKey: 'id_admin' });
Support.belongsTo(User, { foreignKey: 'id_user' });
Admin.hasMany(Support, { foreignKey: 'id_admin' });
User.hasMany(Support, { foreignKey: 'id_user' });

const Blacklist = sequelize.define('blacklist', {
    id_blacklist: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.TEXT }
});

// Связь с User
Blacklist.belongsTo(User, { foreignKey: 'id_user' });
User.hasMany(Blacklist, { foreignKey: 'id_user' });

const Group = sequelize.define('group', {
    id_group: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    group_number: { type: DataTypes.STRING, allowNull: false },
    hash_code_login: { type: DataTypes.STRING, allowNull: false },
    id_user: { type: DataTypes.INTEGER, allowNull: false },
});

// Связь с User
Group.belongsTo(User, { foreignKey: 'id_user' });
User.hasMany(Group, { foreignKey: 'id_user' });

const UsersInGroup = sequelize.define('users_in_group', {
    id_users_group: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: DataTypes.INTEGER, allowNull: false },
    id_group: { type: DataTypes.INTEGER, allowNull: false },
});

// Связь с User и Group
UsersInGroup.belongsTo(User, { foreignKey: 'id_user' });
UsersInGroup.belongsTo(Group, { foreignKey: 'id_group' });
User.hasMany(UsersInGroup, { foreignKey: 'id_user' });
Group.hasMany(UsersInGroup, { foreignKey: 'id_group' });

const Task = sequelize.define('task', {
    id_task: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    is_available: { type: DataTypes.BOOLEAN, defaultValue: false },
    task_name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
});

const TaskForGroup = sequelize.define('task_for_group', {
    id_task_for_group: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_group: { type: DataTypes.INTEGER, allowNull: false },
    id_task: { type: DataTypes.INTEGER, allowNull: false },
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
    id_user: { type: DataTypes.INTEGER, allowNull: false },
    id_task: { type: DataTypes.INTEGER, allowNull: false },
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

const Purchase = sequelize.define('purchase', {
    id_purchase: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false },
    is_paid: { type: DataTypes.BOOLEAN, defaultValue: false },
    payment_method: { type: DataTypes.STRING },
    created_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    payment_date: { type: DataTypes.DATE },
    id_blocked: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// Связь с User и Task
Purchase.belongsTo(User, { foreignKey: 'id_user' });
User.hasMany(Purchase, { foreignKey: 'id_user' });

module.exports = {
    User,
    Admin,
    Blacklist,
    Group,
    Support,
    UsersInGroup,
    Task,
    TaskForGroup,
    UserMakeTask,
    Purchase
};