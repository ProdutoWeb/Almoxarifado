const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('lista_almoxarifado_-_atualizada_em_julho_2025_-_sem_material_hospitalar.docx.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('pdf_text_output.txt', data.text);
    console.log('Done extracting to pdf_text_output.txt');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
