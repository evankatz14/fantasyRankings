const models = require('../models');

module.exports = {
  getRbs: async (req, res) => {
    try {
      const results = await models.rbs.getRbs();
      res.json(results);
    } catch (err) {
      res.status(400);
      res.send(err);
    }
  },
  updateRbRanks: async (req, res) => {
    try {
      await models.rbs.updateRbRanks(req.body);
      res.sendStatus(200);
    } catch (err) {
      res.status(400);
      res.send(err);
    }
  }
}