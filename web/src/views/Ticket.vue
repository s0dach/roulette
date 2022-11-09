<template>
  <div class="index-layout" v-if="ticket">
    <div class="grid">
      <div class="grid__column grid__column--75 grid__column--support">
        <div class="support">
          <div class="support__head">
            <h1>{{ ticket.subject }}</h1>

            <span class="ticket__status">
              Статус:
              <span v-if="!ticket.is_closed" class="ticket__open">Открыт</span>
              <span v-else class="ticket__red">Закрыт</span>
            </span>
          </div>

          <ul>
            <li class="ticket" v-for="(message, i) in ticket.messages" :key="i">
              <span v-if="message.type === 'user'">
                Вы:
              </span>

              <span v-else>
                Админ:
              </span>

              <span>
                {{ message.message }}
              </span>
            </li>
          </ul>

          <div v-if="!ticket.is_closed">
            <span>Сообщение</span>
            <textarea v-model="message" type="text" placeholder="Проблема" class="chatbox__message-input"></textarea>

            <a @click="sendMessage()" class="button button--vk">Отправить сообщение</a>
          </div>
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
      ticket: null,
      message: ''
    }
  },
  mounted() {
    if (!this.$cookie.get('token')) {
      return this.$router.back()
    }

    this.getTicket()
  },
  methods: {
    getTicket() {
      this.$root.request('GET', `/ticket/${this.$route.params.id}`)
          .then(ticket => {
            this.ticket = ticket
          })
          .catch(err => {
            this.$root.showNotify('error', err);
          })
    },
    sendMessage() {
      this.$root.request('POST', '/ticket/sendMessage', {
        id: this.$route.params.id,
        message: this.message
      }).then(() => {
        this.message = ''

        this.$root.showNotify('success', 'Сообщение отправлено!')

        this.getTicket()
      }).catch(err => {
        this.$root.showNotify('error', err);
      })
    }
  }
}
</script>

<style scoped>

</style>