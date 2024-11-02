from transformers import pipeline

# Türkçe duygu analizi modeli
sentiment_pipeline = pipeline("sentiment-analysis", model="savasy/bert-base-turkish-sentiment-cased")

def analyze_sentiment(text):
    result = sentiment_pipeline(text)
    return result[0]

# Example usage
# print(analyze_sentiment("Bugün çok mutluyum!"))