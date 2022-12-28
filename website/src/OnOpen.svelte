<script>
  import { SozaiApp, Button, TextField, List, ListItem, Slider } from "sozai";
  let secretInput;
  let txtFile;
  import { createEventDispatcher } from "svelte";
  import Fa from "svelte-fa";
  import { faX } from "@fortawesome/free-solid-svg-icons";

  const dispatcher = createEventDispatcher();
  let discordJSON;
  let channelName;
  let messagesAveraging = 100;
  let buttonDisabled = true;
  let bannedWords = new Set();

  function checkDisabled(discordJSON, channelName) {
    return discordJSON == null || channelName?.length == 0;
  }

  $: buttonDisabled = checkDisabled(discordJSON, channelName);

  let binput;

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
      bannedWords: bannedWords,
      messagesAveraging: messagesAveraging,
      channelName: channelName,
    });
  }
</script>

<SozaiApp>
  <h2>Discord Club Analyzer !</h2>

  <p>Just upload a .txt file here!</p>

  <input
    bind:this={secretInput}
    type="file"
    id="upload-input"
    accept="txt"
    on:change={setTxt}
  />

  <div id="channel-name-tf">
    <TextField bind:value={channelName} label="Discord Channel Name" outlined />
  </div>

  <!-- <Button on:click={susClick} on:close={setTxt}>Choose File</Button> -->

  <h4 style="margin-top: 0.6em;">WordCloud Parameters</h4>
  <List>
    {#if Array.from(bannedWords).length > 0}<h3 id="banned-word-banner">
        Excluded Words In The WordCloud
      </h3>
    {/if}
    <div style="margin-top: 1em; margin-bottom: 1em;">
      {#each Array.from(bannedWords) as word, i}
        <div class="excluded-word-item">
          <h5 style="font-size: 1.5em;">{i + 1}. {word}</h5>
          <button
            on:click={() => {
              const deleteWord = Array.from(bannedWords)[i];
              bannedWords.delete(deleteWord);
              bannedWords = bannedWords;
            }}
          >
            <Fa icon={faX} />
          </button>
        </div>
      {/each}
    </div>
  </List>

  <div class="banned-word-row">
    <TextField
      id="banned-words-tf"
      label="Excluded Wordcloud Words"
      outlined
      bind:value={binput}
    />
    <Button
      disabled={binput?.length == 0 || bannedWords.has(binput)}
      on:click={() => {
        bannedWords.add(binput);
        bannedWords = bannedWords;
        binput = "";
      }}>Add Word!</Button
    >
  </div>

  <h4 style="margin-top: 0.6em;">Sentiment Analysis Parameters</h4>

  <div id="sentiment-parameters">
    <TextField
      outlined
      label="Messages to Average"
      bind:value={messagesAveraging}
    />
  </div>

  <Button disabled={buttonDisabled} type="submit" on:click={submitForm}
    >Get Analysis!</Button
  >
</SozaiApp>

<style>
  #channel-name-tf {
    text-align: center;
    margin-left: 25%;
    margin-right: 25%;
  }
  #sentiment-parameters {
    margin-left: 25%;
    margin-right: 25%;
  }

  .excluded-word-item {
    display: flex;
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .button-x {
  }
  #banned-word-banner {
    text-align: center;
    font-size: 1.5em;
  }
  .banned-word-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 20px;
    margin-left: 25%;
    width: 50%;
  }
  #upload-input {
    /* visibility: hidden;
    width: 0;
    height: 0; */
  }
</style>
