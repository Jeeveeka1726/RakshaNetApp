const express = require("express");
const { User, Contact, SOSEvent } = require("../models");
const { Op } = require("sequelize");

const router = express.Router();

// Get all SOS events with optional filtering
router.get("/sos-events", async (req, res) => {
  try {
    const { limit, start, end, userId } = req.query;

    let whereClause = {};
    if (start && end) {
      whereClause.createdAt = {
        [Op.between]: [new Date(start), new Date(end)]
      };
    }
    if (userId) {
      whereClause.userId = userId;
    }

    const options = {
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    };

    if (limit) {
      options.limit = parseInt(limit);
    }

    const sosEvents = await SOSEvent.findAll(options);

    // Transform data to match Firebase format expected by frontend
    const transformedEvents = sosEvents.map(event => ({
      id: event.id,
      type: event.type.toUpperCase(), // Convert to uppercase to match Firebase format
      address: event.address || 'Address not available',
      lat: event.latitude ? parseFloat(event.latitude) : null,
      lng: event.longitude ? parseFloat(event.longitude) : null,
      timestamp: event.createdAt.toISOString(),
      contacts: event.contactsData || [],
      userId: event.userId,
      userName: event.user ? event.user.name : 'Unknown User',
      status: event.status
    }));

    res.json(transformedEvents);
  } catch (error) {
    console.error('Error fetching SOS events:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users with their contact information
router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Contact,
          as: 'contacts',
          where: { isVerified: true },
          required: false
        },
        {
          model: SOSEvent,
          as: 'sosEvents',
          required: false,
          limit: 5,
          order: [['createdAt', 'DESC']]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Transform data for frontend
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || 'Not available',
      age: user.age,
      created_at: user.createdAt,
      lastActivity: user.updatedAt,
      sosCount: user.sosEvents ? user.sosEvents.length : 0,
      status: 'registered',
      location: 'Not available',
      eventTypes: user.sosEvents ? user.sosEvents.map(event => event.type) : [],
      isRealUser: true,
      registeredAt: user.createdAt,
      emergency_contacts_count: user.contacts ? user.contacts.length : 0,
      emergency_contacts: user.contacts ? user.contacts.map(c => c.name) : [],
      emergency_phones: user.contacts ? user.contacts.map(c => c.phone) : [],
      has_emergency_setup: user.contacts && user.contacts.length > 0
    }));

    res.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: Contact,
          as: 'contacts',
          where: { isVerified: true },
          required: false
        },
        {
          model: SOSEvent,
          as: 'sosEvents',
          required: false,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const transformedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || 'Not available',
      age: user.age,
      created_at: user.createdAt,
      lastActivity: user.updatedAt,
      sosCount: user.sosEvents ? user.sosEvents.length : 0,
      status: 'registered',
      location: 'Not available',
      eventTypes: user.sosEvents ? user.sosEvents.map(event => event.type) : [],
      isRealUser: true,
      registeredAt: user.createdAt,
      emergency_contacts_count: user.contacts ? user.contacts.length : 0,
      emergency_contacts: user.contacts ? user.contacts.map(c => c.name) : [],
      emergency_phones: user.contacts ? user.contacts.map(c => c.phone) : [],
      has_emergency_setup: user.contacts && user.contacts.length > 0
    };

    res.json(transformedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get active users (users who have triggered SOS in the last X hours)
router.get("/active-users", async (req, res) => {
  try {
    const hoursBack = parseInt(req.query.hours) || 24;
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursBack);

    const activeUserIds = await SOSEvent.findAll({
      where: {
        createdAt: {
          [Op.gte]: cutoffTime
        }
      },
      attributes: ['userId'],
      group: ['userId']
    });

    const userIds = activeUserIds.map(event => event.userId);
    res.json({ userIds });
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({ error: error.message, userIds: [] });
  }
});

// Get dashboard statistics
router.get("/dashboard-stats", async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get today's SOS events
    const todayEvents = await SOSEvent.count({
      where: {
        createdAt: {
          [Op.gte]: today
        }
      }
    });

    // Get this week's SOS events
    const weekEvents = await SOSEvent.count({
      where: {
        createdAt: {
          [Op.gte]: thisWeek
        }
      }
    });

    // Get this month's SOS events
    const monthEvents = await SOSEvent.count({
      where: {
        createdAt: {
          [Op.gte]: thisMonth
        }
      }
    });

    // Get active users count
    const activeUsers = await SOSEvent.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(now.getTime() - (24 * 60 * 60 * 1000))
        }
      },
      attributes: ['userId'],
      group: ['userId']
    });

    // Get recent events
    const recentEvents = await SOSEvent.findAll({
      limit: 10,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const transformedRecentEvents = recentEvents.map(event => ({
      id: event.id,
      type: event.type.toUpperCase(),
      address: event.address || 'Address not available',
      lat: event.latitude ? parseFloat(event.latitude) : null,
      lng: event.longitude ? parseFloat(event.longitude) : null,
      timestamp: event.createdAt.toISOString(),
      contacts: event.contactsData || [],
      userId: event.userId,
      userName: event.user ? event.user.name : 'Unknown User'
    }));

    res.json({
      todaySOSCount: todayEvents,
      weekSOSCount: weekEvents,
      monthSOSCount: monthEvents,
      activeUsersCount: activeUsers.length,
      recentEvents: transformedRecentEvents
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      todaySOSCount: 0,
      weekSOSCount: 0,
      monthSOSCount: 0,
      activeUsersCount: 0,
      recentEvents: []
    });
  }
});

module.exports = router;
