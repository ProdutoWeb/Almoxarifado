const fs = require('fs');

const text = fs.readFileSync('pdf_text.txt', 'utf-8');
const lines = text.split('\n');

const products = [];
let currentCode = null;
let currentDesc = '';

for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    // Check if line starts with a code
    const match = line.match(/^(\d+)\s+(.+)$/);
    if (match) {
        if (currentCode) {
            products.push({ code: currentCode, desc: currentDesc.trim() });
        }
        currentCode = match[1];
        currentDesc = match[2];
    } else if (currentCode) {
        currentDesc += ' ' + line;
    }
}
if (currentCode) {
    products.push({ code: currentCode, desc: currentDesc.trim() });
}

let sql = `-- Migration to update product codes based on PDF
-- 1. First, mark all products as inactive and without code
UPDATE public.produtos 
SET is_active = false, observacao = 'Código não encontrado no PDF', codigo = 'TEMP_' || substring(id::text from 1 for 8);

-- 2. Update matched products
`;

for (const p of products) {
    // Escape single quotes for SQL
    let cleanDesc = p.desc.replace(/'/g, "''");
    
    // We want to match the first few words to avoid mismatch due to formatting.
    const words = cleanDesc.split(/\s+/).filter(w => w.length > 2).slice(0, 3);
    
    if (words.length > 0) {
        let likeExpr = '%' + words.join('%') + '%';
        sql += `UPDATE public.produtos SET is_active = true, codigo = '${p.code}', observacao = NULL WHERE nome ILIKE '${likeExpr}';\n`;
    }
}

fs.writeFileSync('06_migrate_codes_from_pdf.sql', sql);
console.log('Migration generated.');
