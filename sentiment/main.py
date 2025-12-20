import string
from collections import Counter
import matplotlib.pyplot as plt
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.sentiment.vader import SentimentIntensityAnalyzer

#Import the text file. For the purpose of testing, it's going to read a file with a text entry
text = open('read.txt',encoding = 'utf-8').read()


#All the imported text will be put in lowercase for simplified processing and all the punctuations will be removed
lower_case = text.lower()
cleaned_text = lower_case.translate(str.maketrans('','',string.punctuation))

#The purpose fo tokenizing is to split the entry into separate words (tokens) so the sentiment behind each word can be deciphered
tokenized_words = word_tokenize(cleaned_text, "english")


final_words = []

for word in tokenized_words:
    if word not in stopwords.words('english'):
        final_words.append(word)


lemmatizer = WordNetLemmatizer()
lemmatized_words = [lemmatizer.lemmatize(t) for t in final_words]
emotion_list = []
with open('emotions.txt', 'r') as file:
    for line in file:
        clear_line = line.replace('\n','').replace(',','').replace("'",'').strip()
        word, emotion = clear_line.split(':')
        word = word.strip()
        emotion = emotion.strip()
        
        if word in lemmatized_words:
            emotion_list.append(emotion)

w = Counter(emotion_list)
print(w)


def sentiment_analyse(sentiment_text):
    score = SentimentIntensityAnalyzer().polarity_scores(sentiment_text)
    neg = score['neg']
    pos = score['pos']
    if neg >pos:
        print("Negative Sentiment")
    elif pos > neg:
        print("Positive Sentiment")
    else:
        print("Neutral Vibe")


sentiment_text = " ".join(lemmatized_words)

sentiment_analyse(sentiment_text)



fig, axi = plt.subplots()
axi.bar(w.keys(),w.values())
fig.autofmt_xdate()
plt.savefig('graph1.png')
plt.show()
