<template>
  <div v-if="ticket">
    <div class="kt-subheader kt-grid__item" id="kt_subheader">
      <div class="kt-subheader__main">
        <h3 class="kt-subheader__title">
          Обращение в поддержку с проблемой "{{ ticket.subject }}" от пользователя
          <router-link :to="{name: 'user', params: {id: ticket.user_id}}" tag="a">
            {{ ticket.user.username }}
          </router-link>
        </h3>
      </div>
      <div class="kt-subheader__main">
        <h3 class="kt-subheader__title">
          Статус:
          <span v-if="ticket.is_closed">Закрыт</span>
          <span v-else>Открыт</span>
          <a v-if="!ticket.is_closed" @click="closeTicket" style="cursor: pointer; margin-left: 10px;"
             class="btn btn-sm btn-danger btn-icon btn-icon-md" title="Удалить">
            <i class="la la-close"></i>
          </a>
          <a v-if="ticket.is_closed" @click="openTicket" style="cursor: pointer; margin-left: 10px;"
             class="btn btn-sm btn-default btn-icon btn-icon-md" title="Открыть">
            <i class="la la-edit"></i>
          </a>
        </h3>
      </div>
    </div>

    <div class="messaging">
      <div class="inbox_msg">
        <div class="mesgs">
          <div class="msg_history">
            <div v-for="(message, i) in ticket.messages" :key="i" style="margin-top: 10px;">
              <div v-if="message.type === 'user'" class="incoming_msg">
                <div class="incoming_msg_img"><img :src="ticket.user.avatar" alt="sunil">
                </div>
                <div class="received_msg">
                  <div class="received_withd_msg">
                    <p>{{ message.message }}</p>
                    <span class="time_date"> {{ message.created_at }}</span></div>
                </div>
              </div>
              <div v-else class="outgoing_msg">
                <div class="sent_msg">
                  <p>{{ message.message }}</p>
                  <span class="time_date"> {{ message.created_at }}</span></div>
              </div>
            </div>
          </div>
          <div class="type_msg">
            <div>
              <input v-model="message" style="margin-top: 10px" type="text" class="form-control"
                     placeholder="Сообщение">
              <button @click="sendMessage" style="margin-top: 10px" class="btn btn-brand">Отправить</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      ticket: null,
      message: ''
    }
  },
  mounted() {
    this.getTicket()
  },
  methods: {
    async getTicket() {
      this.$root.request('GET', `/admin/tickets/${this.$route.params.id}`)
          .then((ticket) => {
            this.ticket = ticket

            this.ticket.messages = JSON.parse(ticket.messages)

            this.initScroll()
          })
          .catch(() => {
            this.$router.back()
          })
    },
    async sendMessage() {
      this.$root.request('POST', `/admin/tickets/${this.$route.params.id}/sendMessage`, {
        message: this.message
      })
          .then((ticket) => {
            this.message = ''
            this.ticket = ticket

            this.ticket.messages = JSON.parse(ticket.messages)

            $.wnoty({
              type: 'success',
              message: 'Сообщение отправлено'
            })

            this.initScroll()
          })
          .catch((e) => {
            $.wnoty({
              type: 'error',
              message: e
            })
          })
    },
    async closeTicket() {
      this.$root.request('POST', `/admin/tickets/${this.$route.params.id}/close`)
          .then(() => {
            this.ticket.is_closed = true

            $.wnoty({
              type: 'success',
              message: 'Обращение закрыто'
            })
          })
          .catch((e) => {
            $.wnoty({
              type: 'error',
              message: e
            })
          })
    },
    async openTicket() {
      this.$root.request('POST', `/admin/tickets/${this.$route.params.id}/open`)
          .then(() => {
            this.ticket.is_closed = false

            $.wnoty({
              type: 'success',
              message: 'Обращение открыто'
            })
          })
          .catch((e) => {
            $.wnoty({
              type: 'error',
              message: e
            })
          })
    },
    async initScroll() {
      setTimeout(() => {
        $('.msg_history').scrollTop(999999999)
      }, 100)
    }
  }
}
</script>

<style>
img {
  max-width: 100%;
}

.inbox_people {
  background: #f8f8f8 none repeat scroll 0 0;
  float: left;
  overflow: hidden;
  width: 40%;
  border-right: 1px solid #c4c4c4;
}

.inbox_msg {
  clear: both;
  overflow: hidden;
}

.top_spac {
  margin: 20px 0 0;
}


.recent_heading {
  float: left;
  width: 40%;
}

.srch_bar {
  display: inline-block;
  text-align: right;
  width: 60%;
}

.headind_srch {
  padding: 10px 29px 10px 20px;
  overflow: hidden;
  border-bottom: 1px solid #c4c4c4;
}

.recent_heading h4 {
  color: #05728f;
  font-size: 21px;
  margin: auto;
}

.srch_bar input {
  border: 1px solid #cdcdcd;
  border-width: 0 0 1px 0;
  width: 80%;
  padding: 2px 0 4px 6px;
  background: none;
}

.srch_bar .input-group-addon button {
  background: rgba(0, 0, 0, 0) none repeat scroll 0 0;
  border: medium none;
  padding: 0;
  color: #707070;
  font-size: 18px;
}

.srch_bar .input-group-addon {
  margin: 0 0 0 -27px;
}

.chat_ib h5 {
  font-size: 15px;
  color: #464646;
  margin: 0 0 8px 0;
}

.chat_ib h5 span {
  font-size: 13px;
  float: right;
}

.chat_ib p {
  font-size: 14px;
  color: #989898;
  margin: auto
}

.chat_img {
  float: left;
  width: 11%;
}

.chat_ib {
  float: left;
  padding: 0 0 0 15px;
  width: 88%;
}

.chat_people {
  overflow: hidden;
  clear: both;
}

.chat_list {
  border-bottom: 1px solid #c4c4c4;
  margin: 0;
  padding: 18px 16px 10px;
}

.inbox_chat {
  height: 550px;
  overflow-y: scroll;
}

.active_chat {
  background: #ebebeb;
}

.incoming_msg_img {
  display: inline-block;
  width: 6%;
}

.received_msg {
  display: inline-block;
  padding: 0 0 0 10px;
  vertical-align: top;
  width: 92%;
}

.received_withd_msg p {
  background: #ebebeb none repeat scroll 0 0;
  border-radius: 3px;
  color: #646464;
  font-size: 14px;
  margin: 0;
  padding: 5px 10px 5px 12px;
  width: 100%;
}

.time_date {
  color: #747474;
  display: block;
  font-size: 12px;
  margin: 8px 0 0;
}

.received_withd_msg {
  width: 57%;
}

.mesgs {
  padding: 30px 15px 0 25px;
}

.sent_msg p {
  background: #05728f none repeat scroll 0 0;
  border-radius: 3px;
  font-size: 14px;
  margin: 0;
  color: #fff;
  padding: 5px 10px 5px 12px;
  width: 100%;
}

.outgoing_msg {
  overflow: hidden;
  margin: 26px 0 26px;
}

.sent_msg {
  float: right;
  width: 46%;
}

.input_msg_write input {
  background: rgba(0, 0, 0, 0) none repeat scroll 0 0;
  border: medium none;
  color: #4c4c4c;
  font-size: 15px;
  min-height: 48px;
  width: 100%;
}

.type_msg {
  position: relative;
}

.msg_send_btn {
  background: #05728f none repeat scroll 0 0;
  border: medium none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  font-size: 17px;
  height: 33px;
  position: absolute;
  right: 0;
  top: 11px;
  width: 33px;
}

.messaging {
  padding: 0 0 50px 0;
}

.msg_history {
  height: 516px;
  overflow-y: auto;
}
</style>