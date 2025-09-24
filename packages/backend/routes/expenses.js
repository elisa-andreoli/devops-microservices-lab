
const express = require('express');
const router = express.Router();
const multer = require('multer');
const Expense = require('../models/Expense');
const rabbitmqService = require('../services/rabbitmq');

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.UPLOAD_PATH);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// @route   GET /api/expenses
// @desc    Get all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/expenses
// @desc    Create an expense
router.post('/', upload.single('attachment'), async (req, res) => {
  const { title, comment, startDate, endDate, status, exported } = req.body;
  const attachment = req.file ? req.file.path : null;

  try {
    const newExpense = new Expense({
      title,
      comment,
      startDate,
      endDate,
      status,
      attachment,
      exported: exported || false
    });

    const expense = await newExpense.save();
    
    // Publish message to RabbitMQ
    await rabbitmqService.publishMessage('expense.created', {
      action: 'created',
      entity: 'expense',
      data: expense,
      timestamp: new Date().toISOString()
    });
    
    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/expenses/:id
// @desc    Get a single expense
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }

    res.json(expense);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Expense not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update an expense
router.put('/:id', upload.single('attachment'), async (req, res) => {
  const { title, comment, startDate, endDate, status, exported } = req.body;
  const attachment = req.file ? req.file.path : null;

  // Build expense object
  const expenseFields = {};
  if (title) expenseFields.title = title;
  if (comment) expenseFields.comment = comment;
  if (startDate) expenseFields.startDate = startDate;
  if (endDate) expenseFields.endDate = endDate;
  if (status) expenseFields.status = status;
  if (attachment) expenseFields.attachment = attachment;
  if (exported !== undefined) expenseFields.exported = exported;

  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) return res.status(404).json({ msg: 'Expense not found' });

    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: expenseFields },
      { new: true }
    );

    // Publish message to RabbitMQ
    await rabbitmqService.publishMessage('expense.updated', {
      action: 'updated',
      entity: 'expense',
      data: expense,
      timestamp: new Date().toISOString()
    });

    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }

    await Expense.findByIdAndDelete(req.params.id);

    // Publish message to RabbitMQ
    await rabbitmqService.publishMessage('expense.deleted', {
      action: 'deleted',
      entity: 'expense',
      data: { id: req.params.id },
      timestamp: new Date().toISOString()
    });

    res.json({ msg: 'Expense removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Expense not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
