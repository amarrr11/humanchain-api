
const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident');

// 1. GET /incidents: Get all incidents
router.get('/incidents', async (req, res) => {
  try {
    const incidents = await Incident.findAll();
    res.status(200).json(incidents); // 200 OK - Data fetched successfully
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to retrieve incidents' }); // 500 Internal Server Error
  }
});

// 2. POST /incidents: Create a new incident
router.post('/incidents', async (req, res) => {
  const { title, description, severity } = req.body;
  if (!title || !description || !severity) {
    return res.status(400).json({ error: 'Bad request' }); // 400 Bad Request - Missing required fields
  }
  // More robust validation for severity field
  const validSeverities = ['Low', 'Medium', 'High'];
  if (!validSeverities.includes(severity)) {
    return res.status(400).json({ error: 'Invalid severity value. Valid values are: Low, Medium, High.' });
  }

  try {
    const newIncident = await Incident.create({
      title,
      description,
      severity
    });
    res.status(201).json(newIncident); // 201 Created - Incident created successfully
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to create incident' }); // 500 Internal Server Error
  }
});

// 3. GET /incidents/:id: Get a specific incident by ID
router.get('/incidents/:id', async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' }); // 400 Bad Request - Invalid ID format
  }
  try {
    const incident = await Incident.findByPk(id);
    if (incident) {
      res.status(200).json(incident); // 200 OK - Incident found
    } else {
      res.status(404).json({ error: 'Incident not found' }); // 404 Not Found - Incident not found
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to retrieve incident' }); // 500 Internal Server Error
  }
});

// 4. DELETE /incidents/:id: Delete an incident by ID
router.delete('/incidents/:id', async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' }); // 400 Bad Request - Invalid ID format
  }

  try {
    const deletedCount = await Incident.destroy({
      where: { id }
    });

    if (deletedCount > 0) {
      res.status(200).json({ message: 'Incident deleted successfully' }); // 200 OK - Incident deleted
    } else {
      res.status(204).json({ message: 'Nothing to delete' }); // 204 No Content - Nothing to delete
    }
  } catch (error) {
    console.error('Error deleting incident:', error);
    res.status(500).json({ error: 'Unable to delete incident' }); // 500 Internal Server Error
  }
});

// 5. PUT /incidents/:id: Update an incident by ID
router.put('/incidents/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, severity } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' }); // 400 Bad Request - Invalid ID format
  }

  try {
    const incident = await Incident.findByPk(id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' }); // 404 Not Found - Incident not found
    }

    incident.title = title || incident.title;
    incident.description = description || incident.description;
    incident.severity = severity || incident.severity;

    await incident.save();

    res.status(200).json(incident); // 200 OK - Incident updated
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to update incident' }); // 500 Internal Server Error
  }
});

module.exports = router;
