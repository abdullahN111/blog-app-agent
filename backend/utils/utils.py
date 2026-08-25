import re

def generate_slug(text: str):
    text = text.lower()
    text = text.replace("/", "-")    
    text = text.replace("?", "")     
    text = re.sub(r"[^\w\s-]", "", text)  
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def extract_cloudinary_public_id(url: str) -> str | None:
    """
    Extracts the public_id from a Cloudinary secure_url so it can be deleted.
    e.g. https://res.cloudinary.com/demo/image/upload/v1234567/blog_images/abc123.jpg
      -> blog_images/abc123
    Returns None if the URL doesn't match Cloudinary's pattern (e.g. legacy local paths).
    """
    match = re.search(r"/upload/(?:v\d+/)?(.+)\.\w+$", url)
    return match.group(1) if match else None