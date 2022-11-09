<template>
  <div v-if="config">
    <div class="kt-subheader kt-grid__item" id="kt_subheader">
      <div class="kt-subheader__main">
        <h3 class="kt-subheader__title">Настройки</h3>
      </div>
    </div>

    <div class="kt-content  kt-grid__item kt-grid__item--fluid" id="kt_content">
      <div class="kt-portlet kt-portlet--tabs">
        <div class="kt-portlet__head">
          <div class="kt-portlet__head-toolbar">
            <ul class="nav nav-tabs nav-tabs-line nav-tabs-line-danger nav-tabs-line-2x nav-tabs-line-right" role="tablist">
              <li class="nav-item">
                <a class="nav-link active" data-toggle="tab" href="#site" role="tab" aria-selected="true">
                  Настройки сайта
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#bots" role="tab" aria-selected="true">
                  Настройки ботов
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#crash" role="tab" aria-selected="true">
                  Настройки Crash
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#wheel" role="tab" aria-selected="true">
                  Настройки Wheel
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#coinflip" role="tab" aria-selected="true">
                  Настройки Coinflip
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#bans" role="tab" aria-selected="true">
                  Общая настройка режимов
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#payment" role="tab" aria-selected="true">
                  Настройка оплаты
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#social" role="tab" aria-selected="true">
                  Настройка соц. сетей
                </a>
              </li>
            </ul>
          </div>
        </div>
        <form class="kt-form" onclick="return false;">
          <div class="kt-portlet__body">
            <div class="tab-content">
              <div class="tab-pane active" id="site" role="tabpanel">
                <div class="kt-section">
                  <h3 class="kt-section__title">
                    Настройки сайта:
                  </h3>
                  <div class="form-group row">
                    <div class="col-lg-3">
                      <label>Стоимость доллара в руб:</label>
                      <input type="text" class="form-control" v-model="config.dollar_rate" name="dollar_rate">
                    </div>
                    <div class="col-lg-3">
                      <label>Кол-во предметов в магазине на одной странице:</label>
                      <input type="text" class="form-control" v-model="config.showItemsInShop" name="showItemsInShop">
                    </div>
                    <div class="col-lg-3">
                      <label>Коэффициент покупки:</label>
                      <input type="text" class="form-control" v-model="config.max_buy_percent" name="max_buy_percent">
                    </div>
                    <div class="col-lg-3">
                      <label>Мин. сумма пополнения для активации промо:</label>
                      <input type="number" class="form-control" v-model="config.min_payment_to_promocode" name="min_payment_to_promocode">
                    </div>
                  </div>
                  <div class="form-group row">
                    <div class="col-lg-6">
                      <label>Блокировка вывода всем:</label>
                      <select class="form-control" v-model="config.ban_withdraw_all">
                        <option :selected="!config.ban_withdraw_all" value="0">Нет</option>
                        <option :selected="config.ban_withdraw_all" value="1">Да</option>
                      </select>
                    </div>
                    <div class="col-lg-6">
                      <label>Блокировка вывода новым пользователям:</label>
                      <select class="form-control" v-model="config.ban_withdraw_new_users">
                        <option :selected="!config.ban_withdraw_new_users" value="0">Нет</option>
                        <option :selected="config.ban_withdraw_new_users" value="1">Да</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div class="tab-pane" id="bots" role="tabpanel">
                <div class="kt-section">
                  <h3 class="kt-section__title">
                    Настройки ботов:
                  </h3>
                  <div class="form-group row">
                    <div class="col-lg-6">
                      <label>Мин. кол-во ботов в игре:</label>
                      <input type="number" class="form-control" v-model="config.bots_min" name="bots_min">
                    </div>
                    <div class="col-lg-6">
                      <label>Макс. кол-во ботов в игре:</label>
                      <input type="number" class="form-control" v-model="config.bots_max" name="bots_max">
                    </div>
                  </div>
                  <div class="form-group row">
                    <div class="col-lg-6">
                      <label>Мин. кол-во предметов в ставке:</label>
                      <input type="number" class="form-control" v-model="config.bots_min_items_in_bet" name="bots_min_bet">
                    </div>
                    <div class="col-lg-6">
                      <label>Макс. кол-во предметов в игре:</label>
                      <input type="number" class="form-control" v-model="config.bots_max_items_in_bet" name="bots_max_bet">
                    </div>
                  </div>
                  <div class="form-group row">
                    <div class="col-lg-4">
                      <label>Мин. ставка в игре:</label>
                      <input type="number" class="form-control" v-model="config.bots_min_bet" name="bots_min_bet">
                    </div>
                    <div class="col-lg-4">
                      <label>Макс. ставка в игре:</label>
                      <input type="number" class="form-control" v-model="config.bots_max_bet" name="bots_max_bet">
                    </div>
                    <div class="col-lg-4">
                      <label>Считать ставки в профит:</label>
                      <select class="form-control" v-model="config.bots_is_real">
                        <option :selected="!config.bots_is_real" value="0">Нет</option>
                        <option :selected="config.bots_is_real" value="1">Да</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group row">
                    <div class="col-lg-6">
                      <label>Мин. N секунд для отправки сообщения в чат:</label>
                      <input type="number" class="form-control" v-model="config.bots_fake_message_min_sec" name="bots_fake_message_min_sec">
                    </div>
                    <div class="col-lg-6">
                      <label>Макс. N секунд для отправки сообщения в чат:</label>
                      <input type="number" class="form-control" v-model="config.bots_fake_message_max_sec" name="bots_fake_message_max_sec">
                    </div>
                  </div>
                </div>
              </div>
              <div class="tab-pane" id="crash" role="tabpanel">
                <div class="kt-section">
                  <h3 class="kt-section__title">
                    Настройки Crash:
                  </h3>
                  <div class="form-group row">
                    <div class="col-lg-4">
                      <label>Секунд до старта:</label>
                      <input type="text" class="form-control" v-model="config.crash_time_to_start" name="crash_time_to_start">
                    </div>
                    <div class="col-lg-4">
                      <label>Максимальное кол-во предметов в ставке:</label>
                      <input type="text" class="form-control" v-model="config.crash_max_items_in_bet" name="crash_max_items_in_bet">
                    </div>
                    <div class="col-lg-4">
                      <label>% от ставки добавляется в максимальный вывод:</label>
                      <input type="number" class="form-control" v-model="config.add_coef_withdraw" name="add_coef_withdraw">
                    </div>
                  </div>
                  <div class="form-group row">
                    <div class="col-lg-4">
                      <label>Профит:</label>
                      <input type="number" class="form-control" v-model="config.profit" name="profit">
                    </div>
                    <div class="col-lg-4">
                      <label>Банк:</label>
                      <input type="text" class="form-control" v-model="config.bank" name="bank">
                    </div>
                    <div class="col-lg-4">
                      <label>% в банк:</label>
                      <input type="number" class="form-control" v-model="config.bank_percent" name="bank_percent">
                    </div>
                  </div>
                </div>
              </div>
              <div class="tab-pane" id="wheel" role="tabpanel">
                <div class="kt-section">
                  <h3 class="kt-section__title">
                    Настройки wheel:
                  </h3>
                  <div class="form-group row">
                    <div class="col-lg-4">
                      <label>Профит:</label>
                      <input type="number" class="form-control" v-model="config.profit_wheel" name="profit_wheel">
                    </div>
                    <div class="col-lg-4">
                      <label>Банк:</label>
                      <input type="text" class="form-control" v-model="config.bank_wheel" name="bank__wheel">
                    </div>
                    <div class="col-lg-4">
                      <label>% в банк:</label>
                      <input type="number" class="form-control" v-model="config.bank_percent_wheel" name="bank_wheel">
                    </div>
                  </div>
                </div>
              </div>
              <div class="tab-pane" id="coinflip" role="tabpanel">
                <div class="kt-section">
                  <h3 class="kt-section__title">
                    Настройки coinflip:
                  </h3>
                  <div class="form-group row">
                    <div class="col-lg-6">
                      <label>Коэффицент разности суммы ставки (%):</label>
                      <input type="number" class="form-control" v-model="config.coinflip_difference_price" name="coinflip_difference_price">
                    </div>
                    <div class="col-lg-6">
                      <label>Комиссия (%):</label>
                      <input type="text" class="form-control" v-model="config.coinflip_commission" name="coinflip_commission">
                    </div>
                  </div>
                </div>
              </div>
              <div class="tab-pane" id="bans" role="tabpanel">
                <div class="kt-section">
                  <h3 class="kt-section__title">
                    Общая настройка режимов:
                  </h3>
                  <div class="form-group row">
                    <div class="col-lg-3">
                      <label>Остановить сайт:</label>
                      <select class="form-control" v-model="config.stop_site">
                        <option :selected="!config.stop_site" value="0">Нет</option>
                        <option :selected="config.stop_site" value="1">Да</option>
                      </select>
                    </div>
                    <div class="col-lg-3">
                      <label>Остановить Crash:</label>
                      <select class="form-control" v-model="config.stop_crash">
                        <option :selected="!config.stop_crash" value="0">Нет</option>
                        <option :selected="config.stop_crash" value="1">Да</option>
                      </select>
                    </div>
                    <div class="col-lg-3">
                      <label>Остановить CoinFlip:</label>
                      <select class="form-control" v-model="config.stop_coinflip">
                        <option :selected="!config.stop_coinflip" value="0">Нет</option>
                        <option :selected="config.stop_coinflip" value="1">Да</option>
                      </select>
                    </div>
                    <div class="col-lg-3">
                      <label>Остановить Wheel:</label>
                      <select class="form-control" v-model="config.stop_wheel">
                        <option :selected="!config.stop_wheel" value="0">Нет</option>
                        <option :selected="config.stop_wheel" value="1">Да</option>
                      </select>
                    </div>
                  </div>
                  <div class="form-group row">
                    <div class="col-lg-3">
                      <label>Сообщение об остановке сайта:</label>
                      <input type="text" class="form-control" v-model="config.stop_site_msg" name="stop_site_msg">
                    </div>
                    <div class="col-lg-3">
                      <label>Сообщение об остановке crash:</label>
                      <input type="text" class="form-control" v-model="config.stop_crash_msg" name="stop_crash_msg">
                    </div>
                    <div class="col-lg-3">
                      <label>Сообщение об остановке coinflip:</label>
                      <input type="text" class="form-control" v-model="config.stop_coinflip_msg" name="stop_coinflip_msg">
                    </div>
                    <div class="col-lg-3">
                      <label>Сообщение об остановке wheel:</label>
                      <input type="text" class="form-control" v-model="config.stop_wheel_msg" name="stop_wheel_msg">
                    </div>
                  </div>
                </div>
              </div>
              <div class="tab-pane" id="payment" role="tabpanel">
                <div class="kt-section">
                  <h3 class="kt-section__title">
                    Настройка оплаты:
                  </h3>
                  <div class="form-group row">
                    <div class="col-lg-6">
                      <label>Минимальная сумма пополнения:</label>
                      <input type="number" class="form-control" v-model="config.min_payment" name="min_payment">
                    </div>
                    <div class="col-lg-6">
                      <label>Максимальная сумма пополнения:</label>
                      <input type="number" class="form-control" v-model="config.max_payment" name="max_payment">
                    </div>
                  </div>
                  <div class="form-group row">
                    <div class="col-lg-6">
                      <label>UnitPay public key:</label>
                      <input type="text" class="form-control" v-model="config.unitpay_public_key" name="unitpay_public_key">
                    </div>
                    <div class="col-lg-6">
                      <label>UnitPay secret key:</label>
                      <input type="text" class="form-control" v-model="config.unitpay_secret_key" name="unitpay_secret_key">
                    </div>
                  </div>
                  <div class="form-group row">
                    <div class="col-lg-6">
                      <label>SkinsBack ID:</label>
                      <input type="text" class="form-control" v-model="config.skins_back_id" name="skins_back_id">
                    </div>
                    <div class="col-lg-6">
                      <label>SkinsBack SecretKey:</label>
                      <input type="text" class="form-control" v-model="config.skins_back_secret_key" name="skins_back_secret_key">
                    </div>
                  </div>
                </div>
              </div>
              <div class="tab-pane" id="social" role="tabpanel">
                <div class="kt-section">
                  <h3 class="kt-section__title">
                    Настройка соц. сетей:
                  </h3>
                  <div class="form-group row">
                    <div class="col-lg-4">
                      <label>ВК личные сообщения:</label>
                      <input type="text" class="form-control" v-model="config.vk_question_url" name="vk_question_url">
                    </div>
                    <div class="col-lg-4">
                      <label>ВК группа:</label>
                      <input type="text" class="form-control" v-model="config.vk_group" name="vk_group">
                    </div>
                    <div class="col-lg-4">
                      <label>Процент с пополнения для реферала:</label>
                      <input type="text" class="form-control" v-model="config.percent_referral" name="percent_referral">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="kt-portlet__foot">
            <div class="kt-form__actions">
              <button type="submit" class="btn btn-primary" v-on:click="save">Сохранить</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      config: null,
      oldConfig: null,
      mailing: null
    }
  },
  mounted() {
    this.getConfig()
  },
  methods: {
    getConfig() {
      this.$root.request('GET', `/admin/config`)
          .then((config) => {
            this.config = config
            this.oldConfig = config
          })
          .catch(() => {
            this.$router.back()
          })
    },
    save() {
      this.$root.request('POST', '/admin/config/save', {
        config: this.config,
        mailing: this.mailing
      })
        .then(() => {
          $.wnoty({
            type: 'success',
            message: 'Настройки сохранены'
          })
        })
        .catch((e) => {
          $.wnoty({
            type: 'error',
            message: e
          })
        })
    }
  }
}
</script>