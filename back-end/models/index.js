const { Sequelize } = require("sequelize")

// Database connection
const sequelize = new Sequelize(
  "postgresql://neondb_owner:npg_aMZ5y4BTbuFp@ep-wispy-night-a1q4my9b-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  {
    dialect: "postgres",
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
)

// Import models
const User = require("./User")(sequelize)
const Contact = require("./Contact")(sequelize)
const SOSEvent = require("./SOSEvent")(sequelize)

// Define associations
User.hasMany(Contact, { foreignKey: "userId", as: "contacts" })
Contact.belongsTo(User, { foreignKey: "userId", as: "user" })

User.hasMany(SOSEvent, { foreignKey: "userId", as: "sosEvents" })
SOSEvent.belongsTo(User, { foreignKey: "userId", as: "user" })

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log("✅ Database connection established successfully.")

    await sequelize.sync({ alter: true })
    console.log("✅ Database synchronized successfully.")
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error)
  }
}

module.exports = {
  sequelize,
  User,
  Contact,
  SOSEvent,
  syncDatabase,
}
