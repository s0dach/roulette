<template>
  <div class="index-layout">
    <div class="grid">
      <div class="grid__column grid__column--75 grid__column--support">
        <div class="support">
          <div class="support__head">
            <h1>Ваши тикеты</h1>

            <router-link tag="a" :to="{name: 'CreateTickets'}" class="button button--vk">Создать тикет</router-link>
          </div>

          <ul>
            <router-link tag="li" :to="{name: 'Ticket', params: {id: ticket.id}}" class="ticket" v-for="ticket in tickets" :key="ticket.id">
              {{ ticket.subject }}

              <span class="ticket__status">
                Статус:
                <span v-if="!ticket.is_closed" class="ticket__open">Открыт</span>
                <span v-else class="ticket__red">Закрыт</span>
              </span>
            </router-link>
          </ul>
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
      tickets: []
    }
  },
  mounted() {
    if (!this.$cookie.get('token')) {
      return this.$router.back()
    }

    this.getTickets()
  },
  methods: {
    getTickets() {
      this.$root.request('GET', '/ticket/tickets')
          .then((tickets) => {
            this.tickets = tickets
          })
    }
  }
}
</script>

<style>
  .ticket {
    line-height: 50px;
    white-space: nowrap;
    border-radius: 8px;
    height: 50px;
    background-color: #0e1529;
    padding: 0 30px;
    cursor: pointer;
    margin-bottom: 20px;
  }

  .ticket__status {
    float: right;
  }

  .ticket__open {
    color: green;
  }

  .ticket__red {
    color: red;
  }
</style>