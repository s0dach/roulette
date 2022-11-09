<template>
  <div class="chatbox widget">
    <div class="chatbox__head">
      <span class="chatbox__title">Чат</span>
      <div class="chatbox__count">
        <span class="icon icon--chatbox-count"></span>
        <span class="chatbox__count-value">{{ online }}</span>
      </div>
    </div>

    <div class="chatbox__body">
      <vue-custom-scrollbar class="chatbox__body-scroll-wrapper" :settings="settings">
        <div class="chatbox__body-scroll">
          <div class="chatbox__item" v-for="message of messages" :key="message.id" :class="[message.type === 'system' ? 'chatbox__item--system' : '']">
            <router-link
                         tag="img"
                         :to="{name: 'User', params: { id: message.user.steamId }}"
                         :src="message.user.avatar"
                         alt=""
                         width="30"
                         height="30"
                         class="chatbox__avatar"
                         style="cursor: pointer;"
            />
<!--            <img-->
<!--                         :src="message.user.avatar"-->
<!--                         alt=""-->
<!--                         width="30"-->
<!--                         height="30"-->
<!--                         class="chatbox__avatar"-->
<!--            />-->
            <div class="chatbox__message">
              <span class="chatbox__nickname">
                {{ message.user.username }}

                <span style="color: #fff" v-if="$root.user !== null && ($root.user.role === 'admin' || $root.user.role === 'moderator')">
                  (<span style="cursor: pointer" @click="banUser(message.user)">Бан </span>/<span
                  style="cursor: pointer" @click="deleteMessage(message.id)"> Удалить</span>)
                </span></span>
              <span class="chatbox__message-time">{{ message.time }}</span>
              <span class="chatbox__message-text">
                {{ message.message }}
              </span>
            </div>
          </div>
        </div>
      </vue-custom-scrollbar>
    </div>

    <div class="chatbox__controls">
      <a @click="$modal.show('chat-rule')" class="chatbox__rules">Знакомьтесь с правилами</a>
      <input v-model="message" v-on:keyup="keyUpEnter" type="text" class="chatbox__message-input" placeholder="Текст сообщения">
      <div class="chatbox__controls-bottom">
        <span class="chatbox__symbol-counter">Символов: {{ maxChat - message.length }}</span>
        <button
            class="button button--send-message"
            :disabled="$root.user === null || message.length === 0"
            @click="sendMessage">Отправить
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="js">
import vueCustomScrollbar from 'vue-custom-scrollbar'

export default {
  components: {
    vueCustomScrollbar
  },
  props: ['online'],
  data() {
    return {
      settings: {
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: false,
      },
      messages: [],
      message: '',
      maxChat: 100,
    }
  },
  watch: {
    'message'(newValue, oldValue) {
      if (newValue.length > this.maxChat) {
        this.message = oldValue;
      }
    }
  },
  async created() {
    try {
      this.messages = await this.getMessages();
      this.scrollToEnd();
    } catch (e) {
      this.messages = [];
    }
  },
  methods: {
    scrollToEnd() {
      setTimeout(() => {
        const container = this.$el.querySelector('.chatbox__body-scroll-wrapper');
        container.scrollTop = container.scrollHeight;
      }, 100);
    },
    async getMessages() {
      return new Promise((res, rej) => {
        this.$root.request('GET', '/chat')
            .then(result => {
              return res(result);
            })
            .catch(err => {
              return rej(err);
            })
      });
    },
    sendMessage() {
      this.$root.request('POST', '/chat/send', {
        msg: this.message
      }).then(res => {
        this.message = '';

        this.$root.showNotify('success', 'Сообщение отправлено');
      }).catch(err => {
        this.$root.showNotify('error', err);
      })
    },
    keyUpEnter: function (e) {
      if (e.keyCode === 13) {
        this.sendMessage();
      }
    },
    banUser(user) {
      this.$root.request('POST', `/chat/ban/${user.steamId}`).then(res => {
        this.$root.showNotify('success', 'Пользователь заблокирован');
      }).catch(err => {
        this.$root.showNotify('error', err);
      })
    },
    deleteMessage(id) {
      this.$root.request('POST', `/chat/delete/${id}`).then(res => {
        this.$root.showNotify('success', 'Сообщение удалено');
      }).catch(err => {
        this.$root.showNotify('error', err);
      })
    }
  },
  sockets: {
    chatNewMessage(data) {
      this.messages.push(data);
      this.$forceUpdate();

      this.scrollToEnd();
    },
    chatDeleteMessage(id) {
      const index = this.messages.findIndex(x => x.id === id);

      if (index > -1) {
        this.messages.splice(index, 1);
        this.$forceUpdate();

        this.scrollToEnd();
      }
    },
    chatClear() {
      this.messages = [];
      this.$forceUpdate();

      this.scrollToEnd();
    }
  }
}
</script>

<style lang="scss" src="./Chatbox.scss"></style>