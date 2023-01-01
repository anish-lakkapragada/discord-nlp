<script>
  export let wordCloudResponse;
  import { Buffer } from "buffer";
  let wordCloudSrc;

  async function renderImage() {
    const arrayBuffer = await wordCloudResponse.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));
    let base64data = buffer.toString("base64");
    wordCloudSrc = `data:image/jpeg;base64,${base64data.toString("base64")}`;
  }

  renderImage();
</script>

<div class="container">
  <h4 id="title">WordCloud: Most Common Words</h4>
  <p id="wordcloud-description">
    <i>
      Below shows all of the most common words in the Discord Server channel.
      Note that the words of no meaning (e.g. "the") are excluded along with
      others.
    </i>
  </p>
  <img id="wordcloud-image" src={wordCloudSrc} alt="Wordcloud." />
</div>

<style>
  .container {
    text-align: center;
  }

  #wordcloud-description {
    margin-left: 10em;
    margin-right: 10em;
    font-style: italic;
    font-size: 1em;
  }

  #title {
    font-size: 0.75em;
    margin-top: 0.75em;
  }
  #wordcloud-image {
    height: 15em;
    margin-top: 2em;
  }
</style>
