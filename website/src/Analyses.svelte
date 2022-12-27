<script>
  export let discordJSON;
  export let bannedWords;

  import { ProgressCircular, SozaiApp } from "sozai";
  import WordCloudDisplay from "./WordCloudDisplay.svelte";
  const API_URL = "http://localhost:8000";
  let wordCloudLoaded = false;
  let wordCloudResponse;

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

  getWordCloud();
</script>

<h2>Analysis Page</h2>

<SozaiApp>
  {#if wordCloudLoaded}
    <WordCloudDisplay {wordCloudResponse} />
  {:else}
    <h5 id="wordcloud-unloaded">WordCloud On The Way!</h5>
    <ProgressCircular
      id="progress-bar"
      indeterminate
      radius={40}
      thickness={10}
      color="blue"
    />
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
