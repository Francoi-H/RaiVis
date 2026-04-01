const express = require('express');
const Snippet = require('../models/snippet');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const snippets = await Snippet.findAllByUser(req.userId);
  return res.json({ snippets });
});

router.get('/:id', async (req, res) => {
  const snippet = await Snippet.findById(req.params.id, req.userId);
  if (!snippet) {
    return res.status(404).json({ error: 'Snippet not found' });
  }
  return res.json({ snippet });
});

router.post('/', async (req, res) => {
  const { title, code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const snippet = await Snippet.create(
    req.userId,
    title || 'Untitled',
    code
  );

  return res.status(201).json({ snippet });
});

router.delete('/:id', async (req, res) => {
  const deleted = await Snippet.remove(req.params.id, req.userId);
  if (!deleted) {
    return res.status(404).json({ error: 'Snippet not found' });
  }
  return res.status(204).send();
});

module.exports = router;
