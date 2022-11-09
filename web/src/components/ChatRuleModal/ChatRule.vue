<template>
  <div class="pay-modal">
    <span class="pay-modal__title">Правила чата</span>

    <div class="popup__cont"><p>— Запрещено использовать в никнейме название или ссылки ведущие на сторонний сайт./</p> <p>— Запрещено рекламировать каналы Youtube / Twitch / Discord.</p> <p>— Запрещено оскорблять других участников чата / сайта.</p> <p>— Запрещено упоминание платежных реквизитов в целях попрошайничества.</p> <p>
      — Запрещено распространять URL ссылки и промо-коды (кроме Администрации и Модераторов).
    </p> <p>— Запрещено спамить сообщения в чат по одному символу.</p> <br> <p>
      Любой участник сайта/чата, должен с уважение относится ко всем без исключения участникам.
    </p></div>

    <button class="modal-close" @click="$modal.hide('chat-rule')"></button>
  </div>
</template>

<script>
  export default {

  }
</script>

<style lang="scss" src="../PayModal/PayModal.scss"></style>