<template>
  <transition name="fade">
      <div class="inventory inventory--modal widget" :class="{
        'inventory--not-logged': $root.user === null,
        'inventory--mobile': isMobile
      }">
        <template v-if="$root.user !== null">
          <div class="inventory__head">
            <div class="inventory__head-row">
              <span class="inventory__name inventory__name--big">Размен вещей</span>
            </div>

          <div class="inventory__head-row inventory__head-row--select-items">
            <div class="inventory__select-info">
              <span class="inventory__select-info-title">Выбрано:</span>
              <span class="inventory__select-info-value">$ {{ ($root.user.balance + userInventory.selected.price).toFixed(2) }}</span>
            </div>
          </div>

          <div class="inventory__head-row inventory__head-row--exchange-columns">
            <div class="inventory__select-info">
              <span class="inventory__select-info-title">Получу:</span>
              <span class="inventory__select-info-value">$ {{ selected.price }}</span>
            </div>

            <div class="inventory__sort">
              <span class="inventory__sort-title">Сортировка:</span>
              <span class="inventory__sort-toggle" @click="changeSort">По цене</span>
            </div>
          </div>
            <div class="inventory__head-row">
              <div class="inventory__inputs-group">
                <div class="inventory__text-input-wrapper">
                  <input type="text" class="inventory__text-input" placeholder="Название" v-model="shop.market_hash_name">
                </div>
                <div class="inventory__text-input-wrapper inventory__text-input-wrapper--from">
                  <span class="inventory__text-input-pre">От:</span>
                  <input type="number" class="inventory__text-input inventory__text-input--w-pre" v-model="shop.min">
                </div>
                <div class="inventory__text-input-wrapper inventory__text-input-wrapper--to">
                  <span class="inventory__text-input-pre">До:</span>
                  <input type="number" class="inventory__text-input inventory__text-input--w-pre" v-model="shop.max">
                </div>
              </div>
            </div>
        </div>

          <div class="inventory__scroll-wrapper">
            <vue-custom-scrollbar class="inventory__scroll" :settings="settings" @ps-y-reach-end="loadItems">
              <div class="inventory__items-list">
                <div
                    class="inventory__item"
                    v-for="item of shop.items" :key="item.id"
                    @click="addShopItem(item)"
                    :class="[
                        typeof selected.items[item.id] === 'undefined' ? '' : 'inventory__item--active',
                        'inventory__item inventory__item--' + $root.getStyleItem(item.rarity),
                        ((item.price + selected.price) > ($root.user.balance + userInventory.selected.price)) && typeof selected.items[item.id] === 'undefined' ? 'inventory__item--disabled' : ''
                    ]"
                >
                  <div class="inventory__item-pic-wrapper">
                    <img :src="'https://community.cloudflare.steamstatic.com/economy/image/' + item.icon_url + '/360fx360f'" alt="" class="inventory__item-pic">
                  </div>
                  <span class="inventory__item-price">$ {{ item.price.toFixed(2) }}</span>
                </div>
              </div>
            </vue-custom-scrollbar>
            <span class="inventory__scroll-shadow-bottom"></span>
          </div>

          <div class="inventory__controls inventory__controls--column">
            <button
                class="button button--inventory button--inventory-full"
                :class="Object.keys(selected.items).length > 0 ? 'button--inventory-active' : ''"
                :disabled="Object.keys(selected.items).length === 0"
                @click="buyItems"
            >
              <span class="icon icon--exchange"></span> Разменять вещи
            </button>

            <button class="button button--inventory button--inventory-full" @click="$emit('closeExchange')">
              <span class="icon icon--pick"></span> Назад
            </button>
          </div>
        </template>
      </div>
  </transition>
</template>

<script lang="js">
import vueCustomScrollbar from 'vue-custom-scrollbar'

export default {
  props: ['userInventory', 'isLogged', 'isMobile'],
  components: {
    vueCustomScrollbar
  },
  data() {
    return {
      settings: {
        suppressScrollY: false,
        suppressScrollX: true,
        wheelPropagation: false,
      },
      shop: {
        min: '',
        max: '',
        market_hash_name: '',
        page: 1,
        items: []
      },
      selected: {
        items: {},
        price: 0.00
      },
      sort: 'DESC',
    }
  },
  watch: {
    'shop.min': function (newVal) {
      this.shop.min = newVal;
      this.shop.page = 1;
      this.shop.items = [];

      this.getItems();
    },
    'shop.max': function (newVal) {
      this.shop.max = newVal;
      this.shop.page = 1;
      this.shop.items = [];

      this.getItems();
    },
    'shop.market_hash_name': function (newVal) {
      this.shop.market_hash_name = newVal;
      this.shop.page = 1;
      this.shop.items = [];

      this.getItems();
    },
  },
  mounted() {
    this.getItems();
  },
  methods: {
    getItems() {
      this.$root.request('GET', '/item/all', {
        page: this.shop.page,
        market_hash_name: this.shop.market_hash_name,
        min_price: this.shop.min,
        max_price: this.shop.max,
        sort: this.sort,
        selectedPrice: this.userInventory.selected.price
      }).then(res => {
        const array = this.shop.items;
        Array.prototype.push.apply(array, res);

        this.shop.items = array;
        this.$forceUpdate();
      })
    },
    changeSort() {
      this.sort = this.sort === 'DESC' ? 'ASC' : 'DESC';
      this.shop.page = 1;
      this.shop.items = [];
      this.getItems();
    },
    buyItems() {
      this.$root.request('POST', '/inventory/buy', {
        my: Object.values(this.userInventory.selected.items).map((item) => {
          return item.id
        }),
        ids: Object.values(this.selected.items)
      }).then(() => {
        this.$root.showNotify('success', 'Предметы куплены');

        this.$root.getUser();

        this.selected = {
          items: {},
          price: 0.00
        };
        this.userInventory.selected = {
          items: {},
          price: 0.00
        };
        this.$root.$emit('updateInventory');
      }).catch(err => {
        this.$root.showNotify('error', err);
      })
    },
    addShopItem(item) {
      if (typeof this.selected.items[item.id] === "undefined" &&
          ((item.price + this.selected.price) > (this.$root.user.balance + this.userInventory.selected.price))) {
        return;
      }

      if (typeof this.selected.items[item.id] !== "undefined") {
        delete this.selected.items[item.id];
        this.selected.price = parseFloat((this.selected.price - item.price).toFixed(2));
      } else {
        this.selected.items[item.id] = item.id;
        this.selected.price = parseFloat((this.selected.price + item.price).toFixed(2));
      }
    },
    loadItems(){
      if (this.shop.items.length > 0) {
        this.shop.page += 1;
        this.getItems();
      }
    }
  }
}
</script>

<style lang="scss" src="../Inventory/Inventory.scss"></style>
<style lang="scss" src="./Exchange.scss"></style>