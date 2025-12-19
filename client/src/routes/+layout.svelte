<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";

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
  </style>
  <title>Shats</title>
</svelte:head>

{@render children()}
