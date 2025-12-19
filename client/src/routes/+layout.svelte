<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import { NONE, WHITE_JATSHIE } from "../../../consts";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <style>
    body {
      margin: 0;
      font-family: system-ui, sans-serif;
      background-color: white;
      color: #19191e;
    }

    button {
      font-family: inherit;
      cursor: pointer;
      background-color: white;
      padding: 8px 16px;
      border: NONE;
      border-radius: 4px;
      transition:
        background-color 0.3s,
        color 0.3s;
    }

    button:hover {
      background-color: #19191e;
      color: white;
    }
  </style>
  <title>Shats</title>
</svelte:head>

{@render children()}
