from PyPDF2 import PdfReader


def extract_pdf_text(uploaded_file) -> str:
    try:
        reader = PdfReader(uploaded_file)
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(page.strip() for page in pages if page.strip())
    except Exception:
        return ""
