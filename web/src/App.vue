<template>
  <div>
    <div v-if="$root.tech.status" id="app" class="main-wrapper">
      <Header @openPayModal="$modal.show('pay-modal')"/>

      <div class="tech">{{ $root.tech.message }}</div>

      <Footer />
    </div>
    <div v-else id="app" class="main-wrapper">
      <Header @openPayModal="$modal.show('pay-modal')"/>
      <router-view :user-inventory="userInventory" :online="online"/>
      <Footer />
      <notifications
        group="main"
        position="bottom right"
        classes="toster"
        :ignoreDuplicates=true
      />

      <modal v-if="$resize && $mq.below(1024)" name="pay-modal" width="280" height="200">
        <PayModal />
      </modal>

      <modal v-else name="pay-modal" width="340" height="320">
        <PayModal />
      </modal>

      <modal v-if="$resize && $mq.below(1024)" name="add-balance" width="280" height="auto">
        <AddBalanceMoneyModal />
      </modal>

      <modal v-else name="add-balance" width="400" height="auto">
        <AddBalanceMoneyModal />
      </modal>

      <modal v-if="$resize && $mq.below(1024)" name="chat-rule" width="280" height="200">
        <ChatRule />
      </modal>

      <modal v-else name="chat-rule" width="690" height="auto">
        <ChatRule />
      </modal>
    </div>
  </div>
</template>

<style lang="scss" src="./App.scss"></style>
<script lang="js">
import Header from '@/components/Header/Header.vue';
import Footer from '@/components/Footer/Footer.vue';
import PayModal from "@/components/PayModal/PayModal.vue";
import AddBalanceMoneyModal from "@/components/AddBalanceModal/AddBalanceModal.vue";
import ChatRule from "@/components/ChatRuleModal/ChatRule";

export default {
  name: 'App',
  components: {
    ChatRule,
    Header,
    PayModal,
    Footer,
    AddBalanceMoneyModal
  },
  data() {
    return {
      userInventory: {
        items: [],
        price: 0,
        selected: {
          items: {},
          price: 0.00
        }
      },
      online: 0
    }
  },
  sockets: {
    online(online) {
      this.online = online
    }
  }
}
</script>