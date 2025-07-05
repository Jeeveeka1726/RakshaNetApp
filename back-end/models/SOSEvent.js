const { DataTypes } = require("sequelize")

module.exports = (sequelize) => {
  const SOSEvent = sequelize.define("SOSEvent", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    type: {
      type: DataTypes.ENUM('voice', 'motion', 'button'),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contactsNotified: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    contactsData: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Array of contacts that were notified'
    },
    status: {
      type: DataTypes.ENUM('active', 'resolved', 'false_alarm'),
      defaultValue: 'active',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['createdAt']
      },
      {
        fields: ['type']
      },
      {
        fields: ['status']
      }
    ]
  })

  return SOSEvent
}
