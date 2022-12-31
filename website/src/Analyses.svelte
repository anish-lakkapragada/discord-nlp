<script>
  export let discordJSON;
  export let bannedWords;
  export let channelName;
  export let messagesAveraging;

  import { ProgressCircular, SozaiApp, Dialog, Button } from "sozai";
  import WordCloudDisplay from "./WordCloudDisplay.svelte";
  import SentiDisplay from "./SentiDisplay.svelte";

  const API_URL = "df5a-150-230-44-145.jp.ngrok.io";
  let showFirstDialog = true;
  let wordCloudLoaded = false;
  let sentimentAnalysisLoaded = false;
  let wordCloudResponse, sentimentAnalysisResponse;

  const bannedString =
    Array.from(bannedWords).length > 0
      ? [...bannedWords].reduce((prev, next) => prev + "," + next)
      : "";

  console.log(bannedString);

  // get the wordcloud image back
  async function getWordCloud() {
    discordJSON["bannedWords"] = bannedString;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 20 * 60 * 1000);
    wordCloudResponse = await fetch(`https://${API_URL}/wordcloud`, {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(discordJSON),
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    clearTimeout(id);

    if (wordCloudResponse.status != 200) {
      const data = await wordCloudResponse.json();
      console.warn(data);
    }

    wordCloudLoaded = true;
  }

  async function getSentimentAnalysis() {
    discordJSON["title"] = `Sentiment Analysis in ${channelName} Over Time`;
    discordJSON["messagesAveraging"] = messagesAveraging;
    // let socket = new WebSocket(`wss://${API_URL}/senti`);

    // socket.onopen = function (e) {
    //   console.log("starting it up");
    //   socket.send(JSON.stringify(discordJSON));
    //   console.log("just sent the stuff!");
    // };

    // socket.onmessage = function (event) {
    //   console.log(event.data);
    //   sentimentAnalysisResponse = event.data;
    //   if (sentimentAnalysisResponse != null) {
    //     sentimentAnalysisLoaded = true;
    //   }
    //   // socket.close(1000, "bruh"); // close the socket connection
    // };

    // socket.onclose = function (event) {
    //   if (event.wasClean) {
    //     console.log(
    //       `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
    //     );
    //   } else {
    //     console.log(event);
    //     console.log("[close] Connection died");
    //   }
    // };

    // socket.onerror = function (error) {
    //   console.log(error);
    //   alert(`[error]`);
    // };

    // const controller = new AbortController();
    // const id = setTimeout(() => controller.abort(), 20 * 60 * 1000);
    const sendRequest = await fetch(`https://${API_URL}/senti`, {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(discordJSON),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const idData = await sendRequest.json();
    console.log(idData);

    setInterval(async () => {
      const doneYet = await fetch(`https://${API_URL}/senti/${idData.uuid}`, {
        method: "GET",
        mode: "cors",
      });

    }, 3000)

    // clearTimeout(id);

    // console.log("Here");
    // console.log(sentimentAnalysisResponse);
    // if (sentimentAnalysisResponse.status != 200) {
    //   const data = await sentimentAnalysisResponse.json();
    //   console.warn(data);
    // }

    sentimentAnalysisLoaded = false;
  }

  getSentimentAnalysis();
  // getWordCloud();
</script>

<h2>Analysis Page</h2>

<SozaiApp>
  <Dialog bind:value={showFirstDialog}>
    <h3 slot="title">This will take some time.</h3>
    <p style="text-align: center;">
      Currently, an API is processing the messages to extract and display
      information. For the sentiment analysis plot, approximately 30 messages
      are computed per second.
      <br />
      Work like this takes time and effort. To support developers and projects like
      this, please star:
      <a href="https://github.com/anish-lakkapragada/club-discords-nlp">
        repository.
      </a>
    </p>
    <div slot="actions">
      <Button text on:click={() => (showFirstDialog = false)}>
        I starred the repo
      </Button>
    </div>
  </Dialog>
  {#if wordCloudLoaded}
    <WordCloudDisplay {wordCloudResponse} />
  {:else}
    <h5 id="wordcloud-unloaded">WordCloud On The Way!</h5>
    <div class="progress-bar">
      <ProgressCircular
        id="progress-bar"
        indeterminate
        radius={40}
        thickness={10}
        color="blue"
      />
    </div>
  {/if}

  {#if sentimentAnalysisLoaded}
    <SentiDisplay {sentimentAnalysisResponse} {messagesAveraging} />
  {:else}
    <h5 id="wordcloud-unloaded">Sentiment Analysis On The Way!</h5>
    <div class="progress-bar">
      <ProgressCircular
        id="progress-bar"
        indeterminate
        radius={40}
        thickness={10}
        color="blue"
      />
    </div>
  {/if}
</SozaiApp>

<style>
  #wordcloud-unloaded {
    margin-top: 1.5em;
  }

  #progress-bar {
    margin-top: 0.6em;
  }
</style>
