# %%
import requests
import json
from datetime import datetime
from wordcloud import WordCloud, STOPWORDS
from transformers import pipeline
import math
import matplotlib.pyplot as plt
import numpy as np

sentiment_pipeline = pipeline("sentiment-analysis")

with open("ML_CLUB_GENERAL.txt") as f:
    club_data = json.load(f)

only_key = list(club_data["data"].keys())[0]
keys = club_data["data"][only_key].keys()
data = club_data["data"][only_key]

# %%
server_message_string = ""
sentiments = []
times = []
for key in list(keys):
    msg = data[key]
    if "m" in msg:
        times.append(msg["t"] / 10**3)
        server_message_string += msg["m"].lower() + " "
        sentiments.append(sentiment_pipeline(msg["m"])[0]["score"])
# %% WORDCLOUD

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
    "https",
    "stuff",
    "j",
    "ok",
    "c",
    "work",
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


# plot the WordCloud image
plt.figure(figsize=(8, 8), facecolor=None)
plt.imshow(wordcloud)
plt.axis("off")
plt.tight_layout(pad=0)

plt.show()

# %% PLOTTING


def get_club_data(DISCORD_TXT_FILE):
    with open(DISCORD_TXT_FILE) as f:
        club_data = json.load(f)
    return club_data


def calculate_sentiments(club_data):
    sentiments = []
    only_key = list(club_data["data"].keys())[0]
    keys = club_data["data"][only_key].keys()
    data = club_data["data"][only_key]

    for key in list(keys):
        msg = data[key]
        if "m" in msg:
            sentiments.append(sentiment_pipeline(msg["m"])[0]["score"])

    return sentiments


def compile_sentiments(sentiments, times, days_averaging):
    sentiments = np.array(sentiments)
    return (
        np.average(sentiments.reshape(-1, days_averaging), axis=1),
        np.std(sentiments.reshape(-1, days_averaging), axis=1),
        np.average(np.array(times).reshape(-1, days_averaging), axis=1),
    )


def plot_sentiments(
    sentiments_avg,
    sentiments_std,
    times,
    title="Sentiment in ML Club #general over Time",
):
    plt.plot(sentiments_avg)
    plt.xlabel("Time")
    plt.ylabel("Sentiment")

    timestamp_tickers = list(
        map(
            lambda datetime_avg: datetime.fromtimestamp(datetime_avg).strftime(
                "%m/%d/%Y"
            ),
            times,
        )
    )

    assert len(timestamp_tickers) == sentiments_avg.shape[0]

    N = len(timestamp_tickers)
    spaced_array = np.linspace(0, N, N)
    plt.xticks(spaced_array, reversed(timestamp_tickers), rotation=90)

    if sentiments_std:
        plt.fill_between(
            sentiments_avg,
            sentiments_avg - sentiments_std,
            sentiments_avg + sentiments_std,
        )
    plt.title(title)


def plot_given_sentiments(sentiments, N, times, days_averaging=200, show_std=False):
    sentiments_avg, sentiments_std, times_avg = compile_sentiments(
        sentiments[-N:], times[-N:], days_averaging=days_averaging
    )
    if not show_std:
        sentiments_std = None
    plot_sentiments(sentiments_avg, sentiments_std, times_avg)


def sentiment_analysis(
    club_data,
    times,
    title="Sentiment in ML Club #general over Time",
    days_averaging=200,
):
    sentiments = calculate_sentiments(club_data)
    N = len(sentiments)
    sentiments_avg, sentiments_std = compile_sentiments(
        sentiments[-math.floor(N / days_averaging) * days_averaging :], days_averaging
    )
    plot_sentiments(sentiments_avg, sentiments_std, times, title=title)


# %%
