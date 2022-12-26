<script>
  export let name;
  import { SozaiApp, Button } from "sozai";
  import OnOpen from "./OnOpen.svelte";
  import Analyses from "./Analyses.svelte";
  let submitted = false;
  let discordJSON;
</script>

<main>
  <SozaiApp>
    {#if !submitted}
      <OnOpen
        on:submittedTxt={(e) => {
          submitted = true;
          discordJSON = e.detail.discordJSON;
        }}
      />
    {:else}
      <!-- in this case, render component to show the analyses-->
      <Analyses {discordJSON} />
    {/if}
  </SozaiApp>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
