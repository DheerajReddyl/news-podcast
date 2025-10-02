# summarizer.py

import config
from transformers import pipeline

# Initialize the summarization pipeline once when the module is loaded
print("Loading summarization model...")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
print("Summarization model loaded.")

def prepare_script_from_article(article_content: str, title: str) -> list[str]:
    """
    Summarizes article content and formats it into a list of script parts
    for multi-voice generation.
    """
    if not article_content:
        return []

    print(f"Summarizing article: {title}")
    
    try:
        summary_list = summarizer(
            article_content, 
            max_length=250,
            min_length=100, 
            do_sample=False
        )
        summary_text = summary_list[0]['summary_text']

        # Format into distinct parts for different voices
        script_parts = [
            f"Our next story is titled: {title}.",
            summary_text,
            "And that concludes this report."
        ]
        
        return script_parts

    except Exception as e:
        print(f"Error during summarization: {e}")
        # Fallback to simple truncation if summarization fails
        words = article_content.split()
        script_words = words[:config.TARGET_WORD_COUNT]
        fallback_text = " ".join(script_words)
        return [f"The next story is: {title}.", fallback_text]