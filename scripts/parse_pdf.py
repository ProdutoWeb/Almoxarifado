import os
from pypdf import PdfReader
import re
import json

reader = PdfReader('lista_almoxarifado_-_atualizada_em_julho_2025_-_sem_material_hospitalar.docx.pdf')
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

# The format usually has codes and names.
# We will save the text first to see how it looks.
with open('pdf_text.txt', 'w', encoding='utf-8') as f:
    f.write(text)

print("PDF text extracted to pdf_text.txt")
