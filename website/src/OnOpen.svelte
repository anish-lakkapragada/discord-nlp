<script>
  import { SozaiApp, Button } from "sozai";
  let secretInput;
  let txtFile;
  import { createEventDispatcher } from "svelte";
  const dispatcher = createEventDispatcher();
  let discordJSON;
  function susClick() {
    secretInput.click();
    console.log("memes");
  }

  function setTxt(e) {
    const i = e.target.files[0];
    txtFile = i;
    console.log(txtFile);
    const fr = new FileReader();
    fr.addEventListener("load", () => {
      discordJSON = JSON.parse(fr.result);
    });
    fr.readAsText(txtFile);
  }

  //   const fr = new FileReader();
  //   const text = fr.readAsText("ML_CLUB_GENERAL.txt");
  //   console.log(text);

  function submitForm() {
    dispatcher("submittedTxt", {
      discordJSON: discordJSON,
    });
  }
</script>

<SozaiApp>
  <h2>Discord Club Analayzer !</h2>

  <p>Just upload a .txt file here!</p>

  <form on:submit|preventDefault={submitForm}>
    <input
      bind:this={secretInput}
      type="file"
      id="upload-input"
      accept="txt"
      on:change={setTxt}
    />
    <!-- <Button on:click={susClick} on:close={setTxt}>Choose File</Button> -->
    <Button type="submit">Submit Discord Txt!</Button>
  </form>
</SozaiApp>

<style>
  #upload-input {
    /* visibility: hidden;
    width: 0;
    height: 0; */
  }
</style>
