const db = require('../config/db');
const bcrypt = require('bcryptjs');

const Admin = {
    // Find admin by email
    findByEmail: async (email) => {
        try {
            const [rows] = await db.query(
                'SELECT * FROM admins WHERE email = ? AND is_active = TRUE',
                [email]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Admin.findByEmail Error:', error);
            throw error;
        }
    },

    // Find admin by ID
    findById: async (id) => {
        try {
            const [rows] = await db.query(
                'SELECT id, email, name, role, created_at FROM admins WHERE id = ? AND is_active = TRUE',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Admin.findById Error:', error);
            throw error;
        }
    },

    // Verify password
    verifyPassword: async (plainPassword, hashedPassword) => {
        return await bcrypt.compare(plainPassword, hashedPassword);
    },

    // Create admin (for future use)
    create: async (adminData) => {
        try {
            const { email, password, name, role = 'admin' } = adminData;
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const [result] = await db.query(
                `INSERT INTO admins (email, password, name, role) 
                 VALUES (?, ?, ?, ?)`,
                [email, hashedPassword, name, role]
            );
            
            return { id: result.insertId, email, name, role };
        } catch (error) {
            console.error('Admin.create Error:', error);
            throw error;
        }
    }
};

module.exports = Admin;
