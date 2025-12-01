<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { generateId } from '$lib/utils/helpers';

  let {
    id = `input-${generateId(8)}`,
    name = '',
    value = '',
    placeholder = '',
    type = 'text',
    disabled = false,
    required = false,
    class: className = ''
  } = $props<{
    id?: string;
    name?: string;
    value?: string;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
    required?: boolean;
    class?: string;
  }>();

  let inputClass = $derived(
    `input ${className}`.trim()
  );

  function updateValue(event: Event) {
    value = (event.target as HTMLInputElement).value;
    dispatch('input', { value });
  }

  const dispatch = createEventDispatcher();
</script>

<input
  id={id}
  name={name}
  type={type}
  value={value}
  placeholder={placeholder}
  class={inputClass}
  disabled={disabled}
  required={required}
  oninput={updateValue}
/>

<style>
  .input {
    display: block;
    width: 100%;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #212529;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border-radius: 0.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  
  .input:focus {
    color: #212529;
    background-color: #fff;
    border-color: #86b7fe;
    outline: 0;
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  }
</style>