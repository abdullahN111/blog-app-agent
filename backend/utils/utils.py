import re

def generate_slug(text: str):
    text = text.lower()
    text = text.replace("/", "-")    
    text = text.replace("?", "")     
    text = re.sub(r"[^\w\s-]", "", text)  
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")