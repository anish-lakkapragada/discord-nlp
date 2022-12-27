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
from sentiment import _sentiment_analysis


class DiscordJSON(BaseModel):
    meta: dict
    data: dict


class DiscordJSONWordCloud(DiscordJSON):
    bannedWords: str


class DiscordJSONSentiAnalysis(DiscordJSON):
    title: str
    messages_averaging: int


app = FastAPI()
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

    plt.axis("off")
    plt.figure(figsize=(8, 8), facecolor=None)
    plt.imshow(wordcloud)
    plt.tight_layout(pad=0)

    file_name = f"cloud-{time.time()}"
    plt.savefig(file_name, format="png")

    # background_tasks.add_task(remove_file, file_name)
    return FileResponse(file_name)


@app.post("/senti")
def sentiment_analysis(discordJSON: DiscordJSONSentiAnalysis):
    discordJSON = discordJSON.dict()
    file_name = _sentiment_analysis(
        discordJSON, discordJSON["title"], discordJSON["messages_averaging"]
    )
