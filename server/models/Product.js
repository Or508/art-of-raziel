const db = require('../config/db');

const Product = {
    // שליפת כל הקמעות והמזוזות שהכנסנו ל-SQL
    getAll: async () => {
        try {
            const [rows] = await db.query('SELECT * FROM products WHERE is_active = TRUE');
            return rows;
        } catch (error) {
            console.error('Database Error:', error);
            throw error;
        }
    },

    // Update stock by delta (positive or negative)
    updateStockByDelta: async (id, delta) => {
        try {
            const [result] = await db.query(
                'UPDATE products SET stock = GREATEST(stock + ?, 0) WHERE id = ?',
                [delta, id]
            );
            return result;
        } catch (error) {
            console.error('Database Error (updateStockByDelta):', error);
            throw error;
        }
    },

    // Update basic fields, including allow_preorder
    update: async (id, fields) => {
        const allowedFields = ['title', 'title_en', 'description', 'description_en', 'category', 'price', 'price_usd', 'stock', 'allow_preorder', 'is_active'];
        const setClauses = [];
        const values = [];

        for (const key of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(fields, key)) {
                setClauses.push(`${key} = ?`);
                values.push(fields[key]);
            }
        }

        if (setClauses.length === 0) {
            return { affectedRows: 0 };
        }

        values.push(id);

        try {
            const [result] = await db.query(
                `UPDATE products SET ${setClauses.join(', ')} WHERE id = ?`,
                values
            );
            return result;
        } catch (error) {
            console.error('Database Error (update product):', error);
            throw error;
        }
    }
};

module.exports = Product;