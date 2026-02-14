import nltk

# List of NLTK data packages you'll likely need
data_packages = [
    'punkt',           # Tokenizer
    'punkt_tab',       # New tokenizer tables
    'stopwords',       # Stopwords corpus
    'wordnet',        # WordNet lexical database
    'averaged_perceptron_tagger',  # Part-of-speech tagger
    'vader_lexicon',   # Sentiment analysis lexicon
    'omw-eng',         # Open Multilingual WordNet
    'words'            # Word list
]

print("Downloading NLTK data packages...")
for package in data_packages:
    try:
        print(f"Downloading {package}...")
        nltk.download(package, quiet=False)
        print(f"✓ {package} downloaded")
    except Exception as e:
        print(f"✗ Error downloading {package}: {e}")

print("\nAll downloads complete!")
print("NLTK data should now be available at: ~/nltk_data")
