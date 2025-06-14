// Incident routes with JWT authentication protection
const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

// 1. GET /incidents: Get all incidents (public access, but shows user info if authenticated)
router.get('/incidents', optionalAuth, async (req, res) => {
  try {
    const incidents = await Incident.findAll({
      order: [['reported_at', 'DESC']] // Show newest incidents first
    });
    
    // Add user context to response if authenticated
    const response = {
      incidents,
      total: incidents.length
    };
    
    if (req.user) {
      response.authenticated_user = req.user.username;
    }
    
    res.status(200).json(response); // 200 OK - Data fetched successfully
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ error: 'Unable to retrieve incidents' }); // 500 Internal Server Error
  }
});

// 2. POST /incidents: Create a new incident (requires authentication)
router.post('/incidents', authenticateToken, async (req, res) => {
  try {
    const { title, description, severity } = req.body;
    
    // Validate required fields
    if (!title || !description || !severity) {
      return res.status(400).json({ 
        error: 'Title, description, and severity are required.' 
      }); // 400 Bad Request - Missing required fields
    }
    
    // Validate severity field
    const validSeverities = ['Low', 'Medium', 'High'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ 
        error: 'Invalid severity value. Valid values are: Low, Medium, High.' 
      });
    }

    // Create new incident with user information
    const newIncident = await Incident.create({
      title,
      description,
      severity,
      // You could add a user_id field to track who created the incident
      // created_by: req.user.id
    });
    
    res.status(201).json({
      message: 'Incident created successfully.',
      incident: newIncident,
      created_by: req.user.username // Show who created the incident
    }); // 201 Created - Incident created successfully
    
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({ error: 'Unable to create incident' }); // 500 Internal Server Error
  }
});

// 3. GET /incidents/:id: Get a specific incident by ID (public access)
router.get('/incidents/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: 'Invalid ID format. ID must be a number.' 
      }); // 400 Bad Request - Invalid ID format
    }
    
    const incident = await Incident.findByPk(id);
    
    if (incident) {
      const response = { incident };
      
      // Add user context if authenticated
      if (req.user) {
        response.viewed_by = req.user.username;
      }
      
      res.status(200).json(response); // 200 OK - Incident found
    } else {
      res.status(404).json({ 
        error: 'Incident not found' 
      }); // 404 Not Found - Incident not found
    }
    
  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({ error: 'Unable to retrieve incident' }); // 500 Internal Server Error
  }
});

// 4. PUT /incidents/:id: Update an incident by ID (requires authentication)
router.put('/incidents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, severity } = req.body;

    // Validate ID format
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: 'Invalid ID format. ID must be a number.' 
      }); // 400 Bad Request
    }

    // Validate severity if provided
    const validSeverities = ['Low', 'Medium', 'High'];
    if (severity && !validSeverities.includes(severity)) {
      return res.status(400).json({ 
        error: 'Invalid severity value. Valid values are: Low, Medium, High.' 
      });
    }

    // Find the incident
    const incident = await Incident.findByPk(id);
    if (!incident) {
      return res.status(404).json({ 
        error: 'Incident not found' 
      }); // 404 Not Found
    }

    // Apply partial updates if provided
    if (title) incident.title = title;
    if (description) incident.description = description;
    if (severity) incident.severity = severity;

    // Save the updated incident
    await incident.save();

    res.status(200).json({
      message: 'Incident updated successfully.',
      incident: incident,
      updated_by: req.user.username // Show who updated the incident
    }); // 200 OK
    
  } catch (error) {
    console.error('Update incident error:', error);
    res.status(500).json({ error: 'Unable to update incident' }); // 500 Internal Server Error
  }
});

// 5. DELETE /incidents/:id: Delete an incident by ID (requires admin privileges)
router.delete('/incidents/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (isNaN(id)) {
      return res.status(400).json({ 
        error: 'Invalid ID format. ID must be a number.' 
      }); // 400 Bad Request - Invalid ID format
    }

    // Attempt to delete the incident
    const deletedCount = await Incident.destroy({
      where: { id }
    });

    if (deletedCount > 0) {
      res.status(200).json({ 
        message: 'Incident deleted successfully.',
        deleted_by: req.user.username // Show who deleted the incident
      }); // 200 OK - Incident deleted
    } else {
      res.status(404).json({ 
        error: 'Incident not found' 
      }); // 404 Not Found - Nothing to delete
    }
    
  } catch (error) {
    console.error('Delete incident error:', error);
    res.status(500).json({ error: 'Unable to delete incident' }); // 500 Internal Server Error
  }
});

module.exports = router;