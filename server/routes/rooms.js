const express = require('express');
const Room = require('../models/room');
const User = require('../models/user');
const router = express.Router();

// GET /api/rooms/:roomId - Get room info
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findByRoomId(roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      room: {
        roomId: room.roomId,
        createdBy: room.createdBy,
        createdAt: room.createdAt,
        settings: room.settings,
        participantCount: room.participants.filter(p => p.isActive).length,
        participants: room.participants.filter(p => p.isActive).map(p => ({
          username: p.username,
          joinedAt: p.joinedAt
        }))
      }
    });
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get room information',
      error: error.message
    });
  }
});

// POST /api/rooms - Create a new room
router.post('/', async (req, res) => {
  try {
    const { roomId, createdBy, settings = {} } = req.body;

    if (!roomId || !createdBy) {
      return res.status(400).json({
        success: false,
        message: 'Room ID and creator username are required'
      });
    }

    // Check if room already exists
    const existingRoom = await Room.findByRoomId(roomId);
    if (existingRoom) {
      return res.status(409).json({
        success: false,
        message: 'Room already exists'
      });
    }

    // Check if user is authenticated and has room creation limits
    const user = await User.findByUsername(createdBy);
    if (user && !user.canCreateRoom()) {
      return res.status(403).json({
        success: false,
        message: 'Room creation limit reached. Upgrade to Pro for unlimited rooms.',
        upgradeRequired: true
      });
    }

    // Create room
    const room = await Room.createRoom(roomId, createdBy, settings);

    // Update user's room history if they have an account
    if (user) {
      await user.addRoomToHistory(roomId, `Room ${roomId}`, 'creator');
      user.usage.roomsCreated += 1;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Room created successfully',
      room: {
        roomId: room.roomId,
        createdBy: room.createdBy,
        settings: room.settings
      }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room',
      error: error.message
    });
  }
});

// POST /api/rooms/:roomId/join - Join a room
router.post('/:roomId/join', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    // Find or create room
    let room = await Room.findByRoomId(roomId);
    if (!room) {
      // Auto-create room if it doesn't exist (maintains current UX)
      room = await Room.createRoom(roomId, username);
    } else {
      // Add user to existing room
      await room.addParticipant(username);
    }

    // Update user's room history if they have an account
    const user = await User.findByUsername(username);
    if (user) {
      const role = room.createdBy === username ? 'creator' : 'participant';
      await user.addRoomToHistory(roomId, `Room ${roomId}`, role);
    }

    res.json({
      success: true,
      message: 'Successfully joined room',
      room: {
        roomId: room.roomId,
        createdBy: room.createdBy,
        isCreator: room.createdBy === username,
        canInvite: room.canInvite(username),
        participantCount: room.participants.filter(p => p.isActive).length
      }
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join room',
      error: error.message
    });
  }
});

// POST /api/rooms/:roomId/leave - Leave a room
router.post('/:roomId/leave', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const room = await Room.findByRoomId(roomId);
    if (room) {
      await room.removeParticipant(username);
    }

    res.json({
      success: true,
      message: 'Successfully left room'
    });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave room',
      error: error.message
    });
  }
});

// GET /api/rooms/:roomId/participants - Get room participants
router.get('/:roomId/participants', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findByRoomId(roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const activeParticipants = room.participants
      .filter(p => p.isActive)
      .map(p => ({
        username: p.username,
        joinedAt: p.joinedAt,
        isCreator: p.username === room.createdBy
      }));

    res.json({
      success: true,
      participants: activeParticipants,
      createdBy: room.createdBy
    });
  } catch (error) {
    console.error('Error getting participants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get participants',
      error: error.message
    });
  }
});

// GET /api/rooms/:roomId/can-invite/:username - Check if user can invite
router.get('/:roomId/can-invite/:username', async (req, res) => {
  try {
    const { roomId, username } = req.params;
    const room = await Room.findByRoomId(roomId);
    
    if (!room) {
      return res.json({
        success: true,
        canInvite: true // If room doesn't exist yet, anyone can invite (room creator)
      });
    }

    res.json({
      success: true,
      canInvite: room.canInvite(username),
      isCreator: room.createdBy === username,
      isParticipant: room.isParticipant(username)
    });
  } catch (error) {
    console.error('Error checking invite permission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check invite permission',
      error: error.message
    });
  }
});

module.exports = router;
