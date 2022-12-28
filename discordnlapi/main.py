import fastapi
from fastapi import FastAPI, APIRouter, UploadFile
from fastapi.responses import FileResponse, Response, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from wordcloud import WordCloud, STOPWORDS
from transformers import pipeline
import matplotlib.pyplot as plt
from io import BytesIO
import time
import os
from pydantic import BaseModel
from starlette.background import BackgroundTasks
from mangum import Mangum

##### SENTIMENT


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

    plt.switch_backend("agg")

    fig = plt.figure(figsize=(20, 15))
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

    if sentiments_std != None:
        plt.fill_between(
            sentiments_avg,
            sentiments_avg - sentiments_std,
            sentiments_avg + sentiments_std,
        )
    plt.title(title)
    file_name = f"senti-{time.time()}"
    plt.savefig(file_name, format="png")
    plt.close(fig)
    return file_name


def _sentiment_analysis(
    club_data,
    title,
    days_averaging=200,
):
    sentiments, times = calculate_sentiments(club_data)
    N = len(sentiments)
    sentiments_avg, sentiments_std, times_average = compile_sentiments(
        sentiments[-math.floor(N / days_averaging) * days_averaging :],
        times[-math.floor(N / days_averaging) * days_averaging :],
        days_averaging,
    )

    file_name = plot_sentiments(sentiments_avg, None, times_average, title=title)
    return file_name


#####


class DiscordJSON(BaseModel):
    meta: dict
    data: dict


class DiscordJSONWordCloud(DiscordJSON):
    bannedWords: str


class DiscordJSONSentiAnalysis(DiscordJSON):
    title: str
    messagesAveraging: int


app = FastAPI()
handler = Mangum(app)
router = APIRouter()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sentiment_pipeline = pipeline("sentiment-analysis")


def remove_file(path: str) -> None:
    os.unlink(path)


@app.get("/")
async def get():
    return "We here"


@app.post("/wordcloud")
async def wordcloud(discordJSON: DiscordJSONWordCloud):
    discordJSON = discordJSON.dict()
    bannedWords = discordJSON["bannedWords"]
    only_key = list(discordJSON["data"].keys())[0]
    keys = discordJSON["data"][only_key].keys()
    data = discordJSON["data"][only_key]
    stopwords = set(STOPWORDS)
    for word in bannedWords.split(","):
        stopwords.add(word)

    server_message_string = ""
    for key in list(keys):
        msg = data[key]
        if "m" in msg:
            server_message_string += msg["m"].lower() + " "

    wordcloud = WordCloud(
        width=1600,
        height=1600,
        max_words=1500,
        background_color="white",
        stopwords=stopwords,
        min_font_size=5,
    ).generate(server_message_string)

    fig = plt.figure(figsize=(20, 20))
    plt.axis("off")
    plt.imshow(wordcloud)

    file_name = f"cloud-{time.time()}"
    plt.savefig(file_name, format="png")
    plt.close(fig)

    # background_tasks.add_task(remove_file, file_name)
    return FileResponse(file_name)


@app.post("/senti")
def sentiment_analysis(discordJSON: DiscordJSONSentiAnalysis):
    discordJSON = discordJSON.dict()
    file_name = _sentiment_analysis(
        discordJSON, discordJSON["title"], discordJSON["messagesAveraging"]
    )
    print(f"this is the file_name: {file_name}")
    return FileResponse(file_name)
