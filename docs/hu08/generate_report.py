"""Build the Word report from the verified Markdown and the supplied reference.

Run with the managed artifact Python runtime and --template <reference.docx>.
The source document is read only. Rendering is a separate required QA step.
"""
from pathlib import Path
import argparse, re, hashlib
from copy import deepcopy
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from PIL import Image

ap=argparse.ArgumentParser()
ap.add_argument('--template',required=True)
args=ap.parse_args()
base=Path(__file__).resolve().parent
source=Path(args.template)
before=hashlib.sha256(source.read_bytes()).hexdigest()
doc=Document(source)
for child in list(doc._element.body):
    if child.tag!=qn('w:sectPr'): doc._element.body.remove(child)
for relation in list(doc.part.rels.values()):
    if relation.reltype.endswith('/image'): doc.part.drop_rel(relation.rId)
normal=doc.styles['normal'] if 'normal' in doc.styles else doc.styles['Normal']
normal.font.name='Arial'; normal.font.size=Pt(11);normal.font.color.rgb=RGBColor(0,0,0)
normal.paragraph_format.space_after=Pt(6)
normal.paragraph_format.line_spacing=1.12
for name in ['Title','Heading 1','Heading 2','Heading 3']:
    st=doc.styles[name]; st.font.name='Arial';st.font.color.rgb=RGBColor(0,0,0)
    st.paragraph_format.keep_with_next=True
    pr=st.element.find(qn('w:pPr'))
    if pr is not None:
        for border in list(pr.findall(qn('w:pBdr'))):pr.remove(border)

def inline(p,text):
    # Keep evidence links relative to this report and public source URLs active.
    for token in re.split(r'(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)',text):
        if not token:continue
        link=re.fullmatch(r'\[([^\]]+)\]\(([^)]+)\)',token)
        if link:
            rel=doc.part.relate_to(link[2],'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',is_external=True)
            el=OxmlElement('w:hyperlink');el.set(qn('r:id'),rel)
            run=OxmlElement('w:r');props=OxmlElement('w:rPr');color=OxmlElement('w:color');color.set(qn('w:val'),'0563C1');props.append(color);run.append(props)
            node=OxmlElement('w:t');node.text=link[1];run.append(node);el.append(run);p._p.append(el)
        elif token.startswith('**'):p.add_run(token[2:-2]).bold=True
        elif token.startswith('`'):
            run=p.add_run(token[1:-1]);run.font.name='Consolas';run.font.size=Pt(10)
        else:p.add_run(token)

def table(lines):
    rows=[[cell.strip() for cell in line.strip().strip('|').split('|')] for line in lines]
    rows=[row for row in rows if not all(re.fullmatch(r'[: -]+',x) for x in row)]
    n=len(rows[0]);t=doc.add_table(rows=0,cols=n);t.alignment=WD_TABLE_ALIGNMENT.CENTER;t.autofit=False
    available=doc.sections[0].page_width-doc.sections[0].left_margin-doc.sections[0].right_margin
    if rows[0][0]=='Fuente':ratios=[.20,.16,.18,.46]
    else:ratios=([.14,.40,.17,.29] if rows[0][0]=='ID' else [.19,.28,.37,.16]) if n==4 else ([.28,.48,.24] if n==3 else [1/n]*n)
    for column,ratio in zip(t.columns,ratios):column.width=int(available*ratio)
    pr=t._tbl.tblPr
    borders=OxmlElement('w:tblBorders')
    for edge in ['top','left','bottom','right','insideH','insideV']:
        b=OxmlElement('w:'+edge);b.set(qn('w:val'),'single');b.set(qn('w:sz'),'4');b.set(qn('w:color'),'D9D9D9');borders.append(b)
    pr.append(borders)
    for ri,row in enumerate(rows):
        cells=t.add_row().cells
        trpr=t.rows[-1]._tr.get_or_add_trPr()
        cant=OxmlElement('w:cantSplit');trpr.append(cant)
        if ri==0:
            repeat=OxmlElement('w:tblHeader');trpr.append(repeat)
        for ci,(cell,text,ratio) in enumerate(zip(cells,row,ratios)):
            cell.width=int(available*ratio);cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            cp=cell._tc.get_or_add_tcPr();margins=OxmlElement('w:tcMar')
            for side in ['top','left','bottom','right']:
                m=OxmlElement('w:'+side);m.set(qn('w:w'),'85');m.set(qn('w:type'),'dxa');margins.append(m)
            cp.append(margins)
            if ri==0:
                shade=OxmlElement('w:shd');shade.set(qn('w:fill'),'DCE6F1');cp.append(shade)
            p=cell.paragraphs[0];p.paragraph_format.space_after=Pt(3);p.paragraph_format.space_before=Pt(3);p.paragraph_format.line_spacing=1.05
            if rows[0][0]=='ID' and ci in (0,2):p.alignment=WD_ALIGN_PARAGRAPH.CENTER
            inline(p,text)
            for run in p.runs:run.font.name='Arial';run.font.size=Pt(10.5);run.font.color.rgb=RGBColor(0,0,0);run.bold=ri==0
    doc.add_paragraph().paragraph_format.space_after=Pt(3)

lines=(base/'REPORTE_HU08.md').read_text(encoding='utf8').splitlines()
i=0
while i<len(lines):
    line=lines[i].strip()
    if not line:i+=1;continue
    if line.startswith('|'):
        block=[]
        while i<len(lines) and lines[i].strip().startswith('|'):block.append(lines[i]);i+=1
        table(block);continue
    figure=re.fullmatch(r'!\[([^\]]*)\]\(([^)]+)\)',line)
    if figure:
        p=doc.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.CENTER;p.paragraph_format.keep_with_next=True
        filename=base/figure[2]
        with Image.open(filename) as im:w,h=im.size
        maxw=(doc.sections[0].page_width-doc.sections[0].left_margin-doc.sections[0].right_margin)/914400
        width=min(maxw,5.4*w/h)
        run=p.add_run();run.add_picture(str(filename),width=Inches(width))
        caption=doc.add_paragraph(figure[1]);caption.paragraph_format.space_after=Pt(10)
        for run in caption.runs:run.italic=True;run.font.size=Pt(10)
        i+=1;continue
    heading=re.match(r'^(#{1,4})\s+(.+)',line)
    if heading:
        level=len(heading[1]);text=heading[2]
        style='Title' if level==1 else f'Heading {min(level-1,3)}'
        p=doc.add_paragraph(text,style=style)
        p.paragraph_format.space_before=Pt(14 if level>1 else 0)
        p.paragraph_format.space_after=Pt(7)
        i+=1;continue
    p=doc.add_paragraph()
    if line.startswith('Criterios cumplidos en este alcance:'):p.paragraph_format.keep_with_next=True
    if line.startswith('- '):p.paragraph_format.left_indent=Inches(.15);inline(p,'• '+line[2:])
    else:inline(p,line)
    i+=1

doc.core_properties.title='Documentación de pruebas de la migración HU08'
doc.core_properties.subject='Validación de TDDLab con PostgreSQL y frontend'
doc.core_properties.author='Andrés'
doc.core_properties.comments=''
output=base/'REPORTE_HU08.docx'
doc.save(output)
assert hashlib.sha256(source.read_bytes()).hexdigest()==before
print(output)
