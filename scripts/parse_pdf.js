import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

let dataBuffer = fs.readFileSync('lista_almoxarifado_-_atualizada_em_julho_2025_-_sem_material_hospitalar.docx.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('pdf_text_output.txt', data.text);
    console.log('Done extracting to pdf_text_output.txt');
}).catch(console.error);
