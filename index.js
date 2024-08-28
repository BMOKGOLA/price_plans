import express from 'express';
import * as sqlite from 'sqlite';
import sqlite3 from 'sqlite3';
import PhoneBill from './price_plans.js'; 

const app = express();
const PORT = process.env.PORT || 4011;

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.static('public'));

// Setup SQLite database connection and migrations
let db;

(async () => {
    try {
        db = await sqlite.open({
            filename: './price_plans/data_plan.db',
            driver: sqlite3.Database
        });

        await db.migrate();

        app.get('/api/price_plans', async (req, res) => {
            const query = `SELECT * FROM price_plan`;
            try {
                const rows = await db.all(query);
                res.json(rows);
            } catch (err) {
                console.error('Error fetching price plans from the database:', err);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        app.post('/api/phonebill', async (req, res) => {
            const { price_plan, actions } = req.body;
            if (!price_plan || !actions) {
                return res.status(400).json({ error: 'price_plan and actions are required' });
            }
            const query = `SELECT call_price, sms_price FROM price_plan WHERE plan_name = ?`;
            try {
                const row = await db.get(query, [price_plan]);
                if (!row) {
                    return res.status(404).json({ error: 'Price plan not found' });
                }
                const total = PhoneBill(actions, row.call_price, row.sms_price);
                res.json({ total });
            } catch (err) {
                console.error('Error querying the database:', err);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        app.post('/api/price_plan/create', async (req, res) => {
            const { plan_name, call_price, sms_price } = req.body;
            if (!plan_name || call_price === undefined || sms_price === undefined) {
                return res.status(400).json({ error: 'Missing required fields: plan_name, call_price, or sms_price' });
            }
            const query = `INSERT INTO price_plan (plan_name, call_price, sms_price) VALUES (?, ?, ?)`;
            try {
                const result = await db.run(query, [plan_name, call_price, sms_price]);
                res.status(201).json({ id: result.lastID, plan_name, call_price, sms_price });
            } catch (err) {
                console.error('Error inserting into the database:', err);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        app.put('/api/price_plan/update', async (req, res) => {
            const { plan_name, call_price, sms_price } = req.body;
            if (!plan_name || call_price === undefined || sms_price === undefined) {
                return res.status(400).json({ error: 'Missing required fields: plan_name, call_price, or sms_price' });
            }
            const query = `UPDATE price_plan SET call_price = ?, sms_price = ? WHERE plan_name = ?`;
            try {
                const result = await db.run(query, [call_price, sms_price, plan_name]);
                if (result.changes === 0) {
                    return res.status(404).json({ error: 'Price plan not found' });
                }
                res.json({ message: 'Price plan updated successfully', plan_name, call_price, sms_price });
            } catch (err) {
                console.error('Error updating the database:', err);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        app.delete('/api/price_plan/delete', async (req, res) => {
            const { id } = req.body;
            if (!id) {
                return res.status(400).json({ error: 'Price plan ID is required' });
            }
            const query = `DELETE FROM price_plan WHERE id = ?`;
            try {
                const result = await db.run(query, [id]);
                if (result.changes === 0) {
                    return res.status(404).json({ error: 'Price plan not found' });
                }
                res.json({ message: 'Price plan deleted successfully', id });
            } catch (err) {
                console.error('Error deleting from the database:', err);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Error setting up the database:', error);
    }
})();

