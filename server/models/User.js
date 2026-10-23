const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    // Create new user
    create: async (userData) => {
        try {
            const { email, password, first_name, last_name, phone } = userData;
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const [result] = await db.query(
                `INSERT INTO users (email, password, first_name, last_name, phone) 
                 VALUES (?, ?, ?, ?, ?)`,
                [email, hashedPassword, first_name || null, last_name || null, phone || null]
            );
            
            return { id: result.insertId, email, first_name, last_name };
        } catch (error) {
            console.error('User.create Error:', error);
            throw error;
        }
    },

    // Find user by email
    findByEmail: async (email) => {
        try {
            const [rows] = await db.query(
                'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('User.findByEmail Error:', error);
            throw error;
        }
    },

    // Find user by ID
    findById: async (id) => {
        try {
            const [rows] = await db.query(
                'SELECT id, email, first_name, last_name, phone, created_at FROM users WHERE id = ? AND is_active = TRUE',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('User.findById Error:', error);
            throw error;
        }
    },

    // Verify password
    verifyPassword: async (plainPassword, hashedPassword) => {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
};

module.exports = User;
