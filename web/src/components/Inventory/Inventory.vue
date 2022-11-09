<template>
  <div class="inventory widget" :class="{ 'inventory--not-logged': ($root.user === null), 'inventory--is-mobile': isMobile }">
    <template v-if="$root.user !== null">
      <div class="inventory__head">
        <div class="inventory__head-row">
          <span class="inventory__name">Инвентарь</span>
          <span class="inventory__balance">$ {{ userInventory.price.toFixed(2) }}</span>
        </div>

        <div class="inventory__head-row inventory__head-row--select-items">
          <div class="inventory__select-info">
            <span class="inventory__select-info-title">Выбрано:</span>
            <span class="inventory__select-info-value">$ {{ userInventory.selected.price.toFixed(2) }}</span>
          </div>
          <button class="button button--select-all" @click="selectAllUserInventory">Выбрать все</button>
        </div>

        <div class="inventory__head-row">
          <div class="inventory__sort">
            <span class="inventory__sort-title">Сортировка:</span>
            <span class="inventory__sort-toggle" @click="changeSort">По цене</span>
          </div>
        </div>
      </div>

      <div class="inventory__scroll-wrapper">
        <vue-custom-scrollbar class="inventory__scroll" :settings="settings">
          <div class="inventory__items-list">
            <div
                v-for="inv of userInventory.items"
                :key="inv.id"
                @click="addInventoryItem(inv)"
                :class="[
                    typeof userInventory.selected.items[inv.id] === 'undefined' ? '' : 'inventory__item--active',
                    'inventory__item inventory__item--' + $root.getStyleItem(inv.item.rarity)
                ]"
            >
              <div class="inventory__item-pic-wrapper">
                <img :src="'https://community.cloudflare.steamstatic.com/economy/image/' + inv.item.icon_url + '/360fx360f'" alt="" class="inventory__item-pic">
              </div>
              <span class="inventory__item-price">$ {{ inv.item.price.toFixed(2) }}</span>
            </div>
          </div>
        </vue-custom-scrollbar>
        <span class="inventory__scroll-shadow-bottom"></span>
      </div>

      <div class="inventory__controls">
        <button class="button button--inventory button--inventory-active" @click="exchangeVisible = true">
          <span class="icon icon--exchange"></span> Размен
        </button>

        <button
            class="button button--inventory"
            :class="Object.keys(userInventory.selected.items).length > 0 ? 'button--inventory-active' : ''"
            :disabled="Object.keys(userInventory.selected.items).length === 0"
            @click="withdrawItem"
        >
          <span class="icon icon--pick"></span> Забрать
        </button>
      </div>

      <button v-if="$resize && $mq.below(1024)" @click="$modal.hide('inventory-modal')" class="inventory__modal-close"></button>
    </template>

    <template v-else>
      <div class="inventory__not-logged-info">
        <button class="button button--auth button--auth-in-widget" @click="$root.redirectToSteam">
          Войти через Steam<span class="icon icon--steam"></span>
        </button>

        <div class="inventory__not-logged-text">
          <p>
            Начни выигрывать прямо сейчас<br>
            вместе с RAFT.GG
          </p>
        </div>
        <button v-if="$resize && $mq.below(1024)" @click="$modal.hide('inventory-modal')" class="inventory__modal-close"></button>
      </div>
    </template>

    <transition name="fade">
      <Exchange
        v-if="exchangeVisible"
        :is-logged="true"
        :is-mobile="isMobile"
        @closeExchange="closeExchange"
        :user-inventory="userInventory"
      />
    </transition>
  </div>
</template>

<script lang="js">
import vueCustomScrollbar from 'vue-custom-scrollbar'
import Exchange from "@/components/Exchange/Exchange.vue";

export default {
  components: {
    vueCustomScrollbar,
    Exchange
  },
  props: ['userInventory', 'isMobile'],
  data() {
    return {
      exchangeVisible: false,
      settings: {
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: false,
      },
      selectedAllUserInventory: false,
      activeWithdrawBtn: true,
      sort: 'DESC',
    }
  },
  mounted() {
    this.getInventory();

    this.$root.$on('updateInventory', () => {
      this.getInventory();
    });
  },
  methods: {
    getInventory() {
      this.$root.request('GET', '/inventory')
          .then(inventory => {
            this.selectedAllUserInventory = false;
            this.userInventory.items = inventory;
            this.userInventory.price = this.sumInventory(inventory)
            this.sortInventory();
          })
          .catch(() => {
            this.selectedAllUserInventory = false;
            this.userInventory.items = [];
            this.userInventory.price = 0;
          })
    },
    selectAllUserInventory() {
      if (!this.selectedAllUserInventory) {
        for (let inv of this.userInventory.items) {
          if (typeof this.userInventory.selected.items[inv.id] === "undefined") {
            this.userInventory.selected.items[inv.id] = inv;
            this.userInventory.selected.price = parseFloat((this.userInventory.selected.price + inv.item.price).toFixed(2));
          }
        }

        this.selectedAllUserInventory = true;
      } else {
        for (let inv of this.userInventory.items) {
          if (typeof this.userInventory.selected.items[inv.id] !== "undefined") {
            delete this.userInventory.selected.items[inv.id];
            this.userInventory.selected.price = parseFloat((this.userInventory.selected.price - inv.item.price).toFixed(2));
          }
        }

        this.selectedAllUserInventory = false;
      }
    },
    changeSort() {
      this.sort = this.sort === 'DESC' ? 'ASC' : 'DESC';
      this.sortInventory();
    },
    sortInventory() {
      if (this.sort === 'DESC') {
        this.userInventory.items = this.userInventory.items.sort(this.priceSortingDesc);
      } else {
        this.userInventory.items = this.userInventory.items.sort(this.priceSortingAsc);
      }
    },
    addInventoryItem(inv) {
      if (typeof this.userInventory.selected.items[inv.id] !== "undefined") {
        delete this.userInventory.selected.items[inv.id];
        this.userInventory.selected.price = parseFloat((this.userInventory.selected.price - inv.item.price).toFixed(2));
      } else {
        this.userInventory.selected.items[inv.id] = inv;
        this.userInventory.selected.price = parseFloat((this.userInventory.selected.price + inv.item.price).toFixed(2));
      }

      this.$forceUpdate();
    },
    withdrawItem() {
      if (Object.keys(this.userInventory.selected.items).length > 1) {
        return this.$root.showNotify('error', 'Одновременно можно вывести только 1 предмет');
      }

      this.$root.showNotify('warn', 'Заявка на вывод обрабатывается');

      this.activeWithdrawBtn = false;

      this.$root.request('POST', '/inventory/withdraw', {
        id: Object.values(this.userInventory.selected.items).map((item) => {
          return item.id
        })[0]
      }).then(() => {
        this.$root.showNotify('success', 'Ваш предмет будет отправлен через 5 минут');
        this.getInventory();
        this.activeWithdrawBtn = true;
        this.userInventory.selected = {
          items: {},
          price: 0.00
        };
      }).catch(err => {
        this.activeWithdrawBtn = true;
        this.$root.showNotify('error', err);
      })
    },
    priceSortingDesc (a, b) {
      if (a.item.price > b.item.price) {
        return -1;
      }
      if (a.item.price < b.item.price) {
        return 1;
      }
      return 0;
    },
    priceSortingAsc (a, b) {
      if (a.item.price < b.item.price) {
        return -1;
      }
      if (a.item.price > b.item.price) {
        return 1;
      }
      return 0;
    },
    closeExchange() {
      this.exchangeVisible = false;
    },
    sumInventory(inventory) {
      let sum = 0

      inventory.map((item) => {
        sum += item.price
      })

      return sum
    }
  }
}
</script>

<style lang="scss" src="./Inventory.scss"></style>