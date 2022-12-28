<script>
  export let discordJSON;
  export let bannedWords;
  export let channelName;
  export let messagesAveraging;

  import { ProgressCircular, SozaiApp } from "sozai";
  import WordCloudDisplay from "./WordCloudDisplay.svelte";
  import SentiDisplay from "./SentiDisplay.svelte";
  const API_URL = "https://3f84-150-230-44-145.jp.ngrok.io";
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
    wordCloudResponse = await fetch(`${API_URL}/wordcloud`, {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(discordJSON),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (wordCloudResponse.status != 200) {
      const data = await wordCloudResponse.json();
      console.warn(data);
    }

    wordCloudLoaded = true;
  }

  async function getSentimentAnalysis() {
    discordJSON["title"] = `Sentiment Analysis in ${channelName} Over Time`;
    discordJSON["messagesAveraging"] = messagesAveraging;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 20 * 60 * 1000);
    sentimentAnalysisResponse = await fetch(`${API_URL}/senti`, {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(discordJSON),
      // signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    clearTimeout(id);

    console.log("Here");
    console.log(sentimentAnalysisResponse);
    if (sentimentAnalysisResponse.status != 200) {
      const data = await sentimentAnalysisResponse.json();
      console.warn(data);
    }

    sentimentAnalysisLoaded = true;
  }

  getSentimentAnalysis();
  getWordCloud();
</script>

<h2>Analysis Page</h2>

<SozaiApp>
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
    <SentiDisplay {sentimentAnalysisResponse} />
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
