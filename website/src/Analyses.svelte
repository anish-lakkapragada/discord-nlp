<script>
  export let discordJSON;
  import WordCloudDisplay from "./WordCloudDisplay.svelte";
  const API_URL = "http://localhost:8000";
  let bannedWords = "a";
  let wordCloudLoaded = false;
  let wordCloudResponse;

  // get the wordcloud image back
  async function getWordCloud() {
    wordCloudResponse = await fetch(`${API_URL}/wordcloud/${bannedWords}`, {
      method: "POST",
      mode: "cors",
      body: JSON.stringify(discordJSON),
      headers: {
        "Content-Type": "application/json",
      },
    });
    wordCloudLoaded = true;
  }

  getWordCloud();
</script>

<h2>Analysis Page</h2>

{#if wordCloudLoaded}
  <WordCloudDisplay {wordCloudResponse} />
{:else}
  <h5 id="wordcloud-unloaded">Your WordCloud is cuming!</h5>
{/if}

<style>
  #wordcloud-unloaded {
    margin-top: 1.5em;
  }
</style>
