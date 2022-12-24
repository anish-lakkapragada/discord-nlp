# %%
import requests
import json


with open("ML_CLUB_GENERAL.txt") as f:
    ml_club_data = json.load(f)

keys = ml_club_data["data"]["951915965849935882"].keys()
data = ml_club_data["data"]["951915965849935882"]


server_message_string = ""

for key in keys:
    msg = data[key]
    if "m" in msg:
        server_message_string += msg["m"].lower() + " "
# %%
from wordcloud import WordCloud, STOPWORDS

stopwords = set(STOPWORDS)
other_words = [
    "ye",
    "lmao",
    "use",
    "wait",
    "lol",
    "think",
    "u",
    "bruh",
    "yea",
    "one",
    "lmfao",
    "ur",
    "thing",
    "make",
    "im",
    "ppl",
    "yeah",
    "bro",
    "tho",
    "got",
    "time",
    "s",
    "dont",
    "oh",
    "good",
    "know",
    "need",
]
for other_word in other_words:
    stopwords.add(other_word)

wordcloud = WordCloud(
    width=1600,
    height=1600,
    max_words=1500,
    background_color="white",
    stopwords=stopwords,
    min_font_size=5,
).generate(server_message_string)

# %%
import matplotlib.pyplot as plt

# plot the WordCloud image
plt.figure(figsize=(8, 8), facecolor=None)
plt.imshow(wordcloud)
plt.axis("off")
plt.tight_layout(pad=0)

plt.show()

# %%
