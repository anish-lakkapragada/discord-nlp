<script>
  export let sentimentAnalysisResponse;

  import { Buffer } from "buffer";
  let sentiSrc;

  async function renderImage() {
    const arrayBuffer = await sentimentAnalysisResponse.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));
    let base64data = buffer.toString("base64");
    sentiSrc = `data:image/jpeg;base64,${base64data.toString("base64")}`;
    console.log(sentiSrc);
  }

  renderImage();
</script>

<div class="container">
  <h4 id="title">Sentiment Analysis Positive/Negative Over Time</h4>
  <p id="senti-description">
    <i>
      Below shows all of the most common words in the Discord Server channel.
      Note that the words of no meaning (e.g. "the") are excluded along with
      others.
    </i>
  </p>
  <img id="senti-image" src={sentiSrc} alt="Sentiment Analysis Plot." />
</div>

<style>
  .container {
    text-align: center;
  }

  #title {
    font-size: 0.75em;
  }

  #senti-description {
    margin-left: 10em;
    margin-right: 10em;
    font-style: italic;
    font-size: 0.4em;
  }

  #senti-image {
    height: 30em;
    margin-top: 2em;
  }
</style>
