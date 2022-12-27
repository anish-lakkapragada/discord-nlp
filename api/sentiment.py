from transformers import pipeline
import math
import matplotlib.pyplot as plt
import time
import numpy as np
from datetime import datetime

sentiment_pipeline = pipeline("sentiment-analysis")


def calculate_sentiments(club_data):
    sentiments = []
    only_key = list(club_data["data"].keys())[0]
    keys = club_data["data"][only_key].keys()
    data = club_data["data"][only_key]

    times = []
    for key in list(keys):
        msg = data[key]
        if "m" in msg:
            sentiments.append(sentiment_pipeline(msg["m"])[0]["score"])
            times.append(msg["t"] / 10**3)

    return sentiments, times


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
    file_name = f"senti-{time.time()}"
    plt.savefig(file_name, format="png")
    return file_name


def _sentiment_analysis(
    club_data,
    title,
    days_averaging=200,
):
    sentiments, times = calculate_sentiments(club_data)
    N = len(sentiments)
    sentiments_avg, sentiments_std = compile_sentiments(
        sentiments[-math.floor(N / days_averaging) * days_averaging :], days_averaging
    )
    file_name = plot_sentiments(sentiments_avg, sentiments_std, times, title=title)
    return file_name
