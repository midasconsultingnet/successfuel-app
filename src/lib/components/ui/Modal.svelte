<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  let {
    title = '',
    open = false,
    closeOnOverlayClick = true
  } = $props<{
    title?: string;
    open?: boolean;
    closeOnOverlayClick?: boolean;
  }>();

  let modalClass = $derived(
    `modal ${open ? 'modal-open' : ''}`.trim()
  );

  function close() {
    // We need to update the open prop via callback or event
    dispatch('close');
  }

  function overlayClick() {
    if (closeOnOverlayClick) {
      close();
    }
  }

  const dispatch = createEventDispatcher();
</script>

<div class={modalClass}>
  <div class="modal-overlay" onclick={overlayClick} />
  <div class="modal-content">
    <header class="modal-header">
      <h2>{title}</h2>
      <button class="modal-close" onclick={close} aria-label="Close">
        ×
      </button>
    </header>
    <div class="modal-body">
      <slot />
    </div>
  </div>
</div>

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }
  
  .modal.modal-open {
    opacity: 1;
    visibility: visible;
  }
  
  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }
  
  .modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    max-width: 90vw;
    max-height: 90vh;
    overflow: auto;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e9ecef;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>