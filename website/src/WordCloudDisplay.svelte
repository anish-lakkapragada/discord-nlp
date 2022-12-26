<script>
  export let wordCloudResponse;
  import { createEventDispatcher } from "svelte";
  const dispatcher = createEventDispatcher();
  import { Buffer } from "buffer";
  let wordCloudSrc;

  async function renderImage() {
    const arrayBuffer = await wordCloudResponse.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));
    let base64data = buffer.toString("base64");
    wordCloudSrc = `data:image/jpeg;base64,${base64data.toString("base64")}`;
    console.log(wordCloudSrc);
  }

  renderImage();
</script>

<img id="wordcloud-image" src={wordCloudSrc} alt="Wordcloud." />

<style>
  #wordcloud-image {
    width: 2em;
    height: 2em;
  }
</style>
