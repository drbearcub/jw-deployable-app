import sys
import json
from fpdf import FPDF
from fpdf.enums import XPos, YPos
import os
import textwrap

FONT_REGULAR = "fonts/DejaVuSans.ttf"
FONT_BOLD = "fonts/DejaVuSans-Bold.ttf"
for font_path in (FONT_REGULAR, FONT_BOLD):
    if not os.path.exists(font_path):
        raise FileNotFoundError(f"Missing font file {font_path}")

if len(sys.argv) != 3:
    print("Usage: python3 json_to_pdf_generic.py <input_json> <output_pdf>")
    sys.exit(1)

INPUT_JSON = sys.argv[1]
OUTPUT_PDF = sys.argv[2]

with open(INPUT_JSON, "r", encoding="utf-8") as f:
    data = json.load(f)

class PDF(FPDF):
    def footer(self):
        self.set_y(-15)
        self.set_font("DejaVu", size=10)
        self.set_text_color(128)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

pdf = PDF()
pdf.add_page()
pdf.add_font("DejaVu", "", FONT_REGULAR)
pdf.add_font("DejaVu", "B", FONT_BOLD)
pdf.set_auto_page_break(auto=True, margin=10)
pdf.set_font("DejaVu", size=12)

def ensure_space(line_height=8):
    if pdf.get_y() + line_height > pdf.h - 10:
        pdf.add_page()

section_num = 0
subsection_num = 0
subsubsection_num = 0

pdf.set_font("DejaVu", "B", size=16)
pdf.cell(0, 10, f"Scraped Content from {data.get('url', '')}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
pdf.ln(5)

for item in data.get("extracted_content", []):
    tag = item.get("tag", "").lower()
    text = item.get("text", "").strip()
    if not text:
        continue

    text = textwrap.fill(text, width=100)

    ensure_space()

    if tag == "h1":
        section_num += 1
        subsection_num = 0
        subsubsection_num = 0
        pdf.add_page()
        pdf.set_font("DejaVu", "B", size=14)
        pdf.set_text_color(0, 0, 100)
        pdf.multi_cell(180, 8, f"{section_num}. {text}")
        pdf.ln(2)

    elif tag == "h2":
        subsection_num += 1
        subsubsection_num = 0
        pdf.set_font("DejaVu", "B", size=13)
        pdf.set_text_color(0, 0, 100)
        pdf.multi_cell(180, 8, f"{section_num}.{subsection_num}. {text}")
        pdf.ln(2)

    elif tag == "h3":
        subsubsection_num += 1
        pdf.set_font("DejaVu", "B", size=12)
        pdf.set_text_color(0, 0, 100)
        pdf.multi_cell(180, 8, f"{section_num}.{subsection_num}.{subsubsection_num}. {text}")
        pdf.ln(2)

    elif tag in ["h4", "h5", "h6"]:
        pdf.set_font("DejaVu", "B", size=11)
        pdf.set_text_color(60, 60, 120)
        pdf.multi_cell(180, 7, text)
        pdf.ln(1)

    elif tag in ["ul", "ol"]:
        pdf.set_font("DejaVu", size=12)
        pdf.set_text_color(0, 0, 0)
        for line in text.split("\n"):
            if line.strip():
                ensure_space()
                pdf.multi_cell(170, 8, f"• {line.strip()}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(2)

    elif tag == "li":
        pdf.set_font("DejaVu", size=12)
        pdf.set_text_color(0, 0, 0)
        pdf.multi_cell(170, 8, f"• {text}", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(1)

    elif tag in ["p", "div", "span", "a"]:
        if tag == "a":
            pdf.set_text_color(0, 0, 255)
        else:
            pdf.set_text_color(0, 0, 0)
        pdf.set_font("DejaVu", size=12)
        pdf.multi_cell(170, 8, text)
        pdf.set_text_color(0, 0, 0)
        pdf.ln(2)

pdf.output(OUTPUT_PDF)
print(f"PDF generated as {OUTPUT_PDF}")