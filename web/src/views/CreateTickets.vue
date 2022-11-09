<template>
  <div class="index-layout">
    <div class="grid">
      <div class="grid__column grid__column--75 grid__column--support">
        <div class="support">
          <div class="support__head">
            <h1>Создать тикет</h1>
          </div>

          <span>Название тикета</span>
          <input v-model="newTicket.subject" type="text" placeholder="Название тикета" class="chatbox__message-input">

          <span>Проблема</span>
          <textarea v-model="newTicket.message" type="text" placeholder="Проблема" class="chatbox__message-input"></textarea>

          <a @click="createTicket" class="button button--vk">Создать тикет</a>
        </div>
      </div>

      <div class="grid__column grid__column--25 grid__column--side-right grid__column--chat">
        <Chatbox :online="online" />
      </div>
    </div>
  </div>
</template>

<script>
import Chatbox from "@/components/Chatbox/Chatbox";

export default {
  props: ['online'],
  components: {
    Chatbox
  },
  data() {
    return {
      newTicket: {
        subject: '',
        message: ''
      }
    }
  },
  mounted() {
    if (!this.$cookie.get('token')) {
      return this.$router.back()
    }
  },
  methods: {
    createTicket() {
      this.$root.request('POST', '/ticket/create', {
        subject: this.newTicket.subject,
        message: this.newTicket.message
      }).then(() => {
        this.newTicket = {
          subject: '',
          message: ''
        }

        this.$root.showNotify('success', 'Тикет создан!')

        this.$router.replace({name: 'Tickets'})
      }).catch(err => {
        this.$root.showNotify('error', err);
      })
    }
  }
}
</script>