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

    button {
      font-family: inherit;
      font-size: 1rem;
      cursor: pointer;
      background-color: white;
      padding: 8px 16px;
      border: NONE;
      border-radius: 4px;
      transition:
        background-color 0.2s,
        color 0.2s;
    }

    button:hover {
      background-color: #19191e;
      color: white;
    }

    /* span > checkbox + label, look alike toggle button */
    span > input[type="checkbox"] {
      display: none;
    }

    span > input[type="checkbox"] + label {
      position: relative;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.2s;
      box-sizing: border-box;
      padding: 8px 16px;
      border-radius: 4px;
    }

    span > input[type="checkbox"]:checked + label {
      background-color: #19191e;
      color: white;
    }
  </style>
  <title>Shats</title>
</svelte:head>

{@render children()}
