<script>
  import { SozaiApp, Button, TextField, List, ListItem, Slider } from "sozai";
  let secretInput;
  let txtFile;
  import { createEventDispatcher } from "svelte";
  import Fa from "svelte-fa";
  import { faX } from "@fortawesome/free-solid-svg-icons";
  import { } from "os";

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
  <h2>Discord Channel Analyzer!</h2>
  <p style="font-size: 1.2em;"> Just upload a .txt file of the Discord Channel [<a href="https://www.youtube.com/watch?v=tt-TBOWLyJk"> instructions</a>]!  <br> <br> 
      You will receive a wordcloud summmarizing some of the most used words and a graph of the sentiment over time.  
  </p>

  <input
    bind:this={secretInput}
    type="file"
    id="upload-input"
    accept="txt text/plain"
    on:change={setTxt}
  />

  <div id="channel-name-tf">
    <TextField bind:value={channelName} label="Channel Name" outlined />
  </div>

  <!-- <Button on:click={susClick} on:close={setTxt}>Choose File</Button> -->

  <h4 style="margin-top: 0.6em">WordCloud Parameters</h4>
  <p style="font-size: 1em"> Enter words below to exclude from the WordCloud. </p>

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
    <div class="banned-words-tf"> 
      <TextField
        label="Enter Word"
        outlined
        bind:value={binput}
      />
    </div>
    <div class="button-add"> 
      <Button
        disabled={binput?.length == 0 || bannedWords.has(binput)}
        on:click={() => {
          bannedWords.add(binput);
          bannedWords = bannedWords;
          binput = "";
        }}>Add Word!</Button
      >
    </div>
  </div>

  <h4 style="margin-top: 0.6em;">Sentiment Analysis Parameters</h4>
  <p style="font-size: 1em"> Enter how many messages to average when computing data points for the sentiment graph. </p>

  <div id="sentiment-parameters">
    <TextField
      outlined
      label="Messages To Average"
      bind:value={messagesAveraging}
      error={isNaN(messagesAveraging) || parseInt(messagesAveraging) <= 1 ? "Must be a number greater than 1." : null }
    />
  </div>

  <div id="submit-btn">
    <Button disabled={buttonDisabled} type="submit" on:click={submitForm}
    >Get Analysis!</Button
    >
  </div>
</SozaiApp>

<style>
  #submit-btn {
    width: 100%; 
  }


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


  #banned-word-banner {
    text-align: center;
    font-size: 1.5em;
  }

  .banned-word-row {
    display: flex; 
    grid-gap: 1em;
    justify-content: center;  
  }

  .button-add :global(.s-button) {
    height: 100%;  /* needs to be as high as the div */
  }
  .banned-words-tf :global(.s-input-container) {
    margin: 0; /* remove any excess */ 
  }

  @media screen and (max-width: 500px) {
    #upload-input {
      width: 100%;
    }

    #channel-name-tf {
      width: 100%; 
      margin-left: 0; 
      margin-right: 0;
    }

    #channel-name-tf :global(.s-input-container) {
      width: 100%;
      text-align: center;
    }

    #sentiment-parameters {
      width: 100%; 
      margin-left: 0; 
      margin-right: 0;
    }

    #sentiment-parameters :global(.s-input-container) {
      width: 100%;
      text-align: center;
    }
  }

  @media screen and (min-width: 500px) {
    #submit-btn :global(.s-button) {
      width: 30em;
    }
  }

</style>
