// Incident routes with JWT authentication protection
const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

// GET /incidents - Get all incidents (public access)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const incidents = await Incident.findAll({
      order: [['reported_at', 'DESC']]
    });
    
    const response = {
      incidents,
      total: incidents.length
    };
    
    if (req.user) {
      response.authenticated_user = req.user.username;
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ error: 'Unable to retrieve incidents' });
  }
});

// POST /incidents - Create new incident (requires auth)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, severity } = req.body;
    
    if (!title || !description || !severity) {
      return res.status(400).json({ 
        error: 'Title, description, and severity are required.' 
      });
    }
    
    const validSeverities = ['Low', 'Medium', 'High'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ 
        error: 'Invalid severity value. Valid values are: Low, Medium, High.' 
      });
    }

    const newIncident = await Incident.create({
      title,
      description,
      severity
    });
    
    res.status(201).json({
      message: 'Incident created successfully.',
      incident: newIncident,
      created_by: req.user.username
    });
    
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({ error: 'Unable to create incident' });
  }
});

// GET /incidents/:id - Get specific incident (public access)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: 'Invalid ID format. ID must be a number.' 
      });
    }
    
    const incident = await Incident.findByPk(id);
    
    if (incident) {
      const response = { incident };
      
      if (req.user) {
        response.viewed_by = req.user.username;
      }
      
      res.status(200).json(response);
    } else {
      res.status(404).json({ 
        error: 'Incident not found' 
      });
    }
    
  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({ error: 'Unable to retrieve incident' });
  }
});

// PUT /incidents/:id - Update incident (requires auth)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, severity } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ 
        error: 'Invalid ID format. ID must be a number.' 
      });
    }

    const validSeverities = ['Low', 'Medium', 'High'];
    if (severity && !validSeverities.includes(severity)) {
      return res.status(400).json({ 
        error: 'Invalid severity value. Valid values are: Low, Medium, High.' 
      });
    }

    const incident = await Incident.findByPk(id);
    if (!incident) {
      return res.status(404).json({ 
        error: 'Incident not found' 
      });
    }

    if (title) incident.title = title;
    if (description) incident.description = description;
    if (severity) incident.severity = severity;

    await incident.save();

    res.status(200).json({
      message: 'Incident updated successfully.',
      incident: incident,
      updated_by: req.user.username
    });
    
  } catch (error) {
    console.error('Update incident error:', error);
    res.status(500).json({ error: 'Unable to update incident' });
  }
});

// DELETE /incidents/:id - Delete incident (requires admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ 
        error: 'Invalid ID format. ID must be a number.' 
      });
    }

    const deletedCount = await Incident.destroy({
      where: { id }
    });

    if (deletedCount > 0) {
      res.status(200).json({ 
        message: 'Incident deleted successfully.',
        deleted_by: req.user.username
      });
    } else {
      res.status(404).json({ 
        error: 'Incident not found' 
      });
    }
    
  } catch (error) {
    console.error('Delete incident error:', error);
    res.status(500).json({ error: 'Unable to delete incident' });
  }
});

module.exports = router;