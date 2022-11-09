<template>
  <div v-if="user">
    <div class="kt-subheader kt-grid__item" id="kt_subheader">
      <div class="kt-subheader__main">
        <h3 class="kt-subheader__title">Редактирование пользователя</h3>
      </div>
    </div>

    <div class="kt-content kt-grid__item kt-grid__item--fluid">
      <div class="row">
        <div class="col-xl-4">
          <div class="kt-portlet kt-portlet--fit kt-portlet--head-lg kt-portlet--head-overlay">
            <div class="kt-portlet__head kt-portlet__space-x">
              <div class="kt-portlet__head-label" style="width: 100%;">
                <h3 class="kt-portlet__head-title text-center" style="width: 100%;">
                  {{ user.username }}
                </h3>
              </div>
            </div>
            <div class="kt-portlet__body">
              <div class="kt-widget28">
                <div class="kt-widget28__visual"
                     :style="'background: url('+user.avatar+') bottom center no-repeat'"></div>
                <div class="kt-widget28__wrapper kt-portlet__space-x">
                  <div class="tab-content">
                    <div id="menu11" class="tab-pane active">
                      <div class="kt-widget28__tab-items">
                        <div class="kt-widget12">
                          <div class="kt-widget12__content">
                            <div class="kt-widget12__item">
                              <div class="kt-widget12__info text-center">
                                <span class="kt-widget12__desc">Сумма пополнений</span>
                                <span class="kt-widget12__value">{{ info.payments.toFixed(2) }} <i class="la la-usd"></i></span>
                              </div>
                              <div class="kt-widget12__info text-center">
                                <span class="kt-widget12__desc">Сумма выводов</span>
                                <span class="kt-widget12__value">{{ user.withdraw.toFixed(2) }} <i
                                    class="la la-usd"></i></span>
                              </div>
                            </div>
                          </div>

                          <div class="kt-widget12__content">
                            <div class="kt-widget12__item">
                              <div class="kt-widget12__info text-center">
                                <span class="kt-widget12__desc">Профит</span>
                                <span class="kt-widget12__value">{{ info.profit.toFixed(2) }} <i class="la la-usd"></i></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-xl-8">
          <div class="kt-portlet">
            <div class="kt-portlet__head">
              <div class="kt-portlet__head-label">
                <h3 class="kt-portlet__head-title">
                  Информация о пользователе
                </h3>
              </div>
            </div>
            <form class="kt-form" v-on:submit="save" onsubmit="return false;">
              <div class="kt-portlet__body">
                <div class="form-group row">
                  <div class="col-lg-6">
                    <label>Имя:</label>
                    <input type="text" class="form-control" v-model="user.username">
                  </div>
                  <div class="col-lg-6">
                    <label>SteamID64:</label>
                    <input type="text" class="form-control" v-model="user.steamId" disabled>
                  </div>
                </div>
                <div class="form-group row">
                  <div class="col-lg-6">
                    <label>Ссылка на обмен:</label>
                    <input type="text" class="form-control" v-model="user.trade_url">
                  </div>
                  <div class="col-lg-6">
                    <label>Профиль STEAM:</label>
                    <div class="kt-input-icon">
                      <input type="text" class="form-control"
                             :value="'https://steamcommunity.com/profiles/'+user.steamId+'/'" disabled>
                      <span class="kt-input-icon__icon kt-input-icon__icon--right"><span><i
                          class="la la-steam"></i></span></span>
                    </div>
                  </div>
                </div>
                <div class="form-group row">
                  <div class="col-lg-6">
                    <label>Баланс:</label>
                    <div class="kt-input-icon">
                      <input type="text" class="form-control" v-model="user.balance">
                      <span class="kt-input-icon__icon kt-input-icon__icon--right"><span><i
                          class="la la-usd"></i></span></span>
                    </div>
                  </div>
                </div>
                <div class="form-group row">
                  <div class="col-lg-6">
                    <label>Реферальный код:</label>
                    <input type="text" class="form-control" v-model="user.referral_code">
                  </div>
                  <div class="col-lg-6">
                    <label>Используемый реферальный код:</label>
                    <input type="text" class="form-control" v-model="user.referral_use">
                  </div>
                </div>
                <div class="form-group row">
                  <div class="col-lg-4">
                    <label>Роль:</label>
                    <select class="form-control" v-model="user.role">
                      <option :selected="user.role === 'user'" value="user">Пользователь</option>
                      <option :selected="user.role === 'moderator'" value="moderator">Модератор</option>
                      <option :selected="user.role === 'admin'" value="admin">Администратор</option>
                      <option :selected="user.role === 'youtuber'" value="youtuber">Ютубер</option>
                    </select>
                  </div>
                  <div class="col-lg-4">
                    <label>Блокировка в чате:</label>
                    <select class="form-control" v-model="user.is_ban_chat">
                      <option :selected="!user.is_ban_chat" value="0">Не заблокирован</option>
                      <option :selected="user.is_ban_chat" value="1">Заблокирован</option>
                    </select>
                  </div>
                  <div class="col-lg-4">
                    <label>Блокировка вывода:</label>
                    <select class="form-control" v-model="user.is_ban_withdraw">
                      <option :selected="!user.is_ban_withdraw" value="0">Не заблокирован</option>
                      <option :selected="user.is_ban_withdraw" value="1">Заблокирован</option>
                    </select>
                  </div>
                </div>

                <div class="kt-portlet__foot kt-portlet__foot--solid">
                  <div class="kt-form__actions">
                    <div class="row">
                      <div class="col-12">
                        <button type="submit" class="btn btn-brand">Сохранить</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div class="kt-content kt-grid__item kt-grid__item--fluid">
      <div class="kt-portlet kt-portlet--mobile">
        <div class="kt-portlet__head kt-portlet__head--lg">
          <div class="kt-portlet__head-label">
            <h3 class="kt-portlet__head-title">
              Инвентарь ({{ info.inventorySum.toFixed(2) }}$)
            </h3>
          </div>
          <div class="kt-portlet__head-toolbar">
            <div class="kt-portlet__head-wrapper">
              <div class="kt-portlet__head-actions">
                <a data-toggle="modal" href="#createInventoryItem" class="btn btn-success btn-elevate btn-icon-sm">
                  <i class="la la-plus"></i>
                  Добавить предмет
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="kt-portlet__body">
          <table class="table table-striped- table-bordered table-hover table-checkable" id="inventory">
            <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Стоимость</th>
              <th>Был получен</th>
              <th>Действия</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="inv in info.inventory" :key="inv.id">
              <td>{{ inv.id }}</td>
              <td>
                <span class="kt-widget3__username">
                  {{ inv.item.market_hash_name }}
                </span>
              </td>
              <td>{{ inv.item.price.toFixed(2) }}$</td>
              <td>{{ $root.parseDate(inv.created_at) }}</td>
              <td>
                <a style="cursor: pointer" @click="deleteItem(inv.id)" class="btn btn-sm btn-danger btn-icon btn-icon-md" title="Удалить">
                  <i class="la la-trash"></i>
                </a>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="kt-content kt-grid__item kt-grid__item--fluid">
      <div class="kt-portlet kt-portlet--mobile">
        <div class="kt-portlet__head kt-portlet__head--lg">
          <div class="kt-portlet__head-label">
            <h3 class="kt-portlet__head-title">
              Список пополнений
            </h3>
          </div>
        </div>
        <div class="kt-portlet__body">
          <table class="table table-striped- table-bordered table-hover table-checkable" id="payments">
            <thead>
            <tr>
              <th>ID</th>
              <th>Сумма</th>
              <th>Дата</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="payment in info.paymentsArr" :key="payment.id">
              <td>{{ payment.id }}</td>
              <td>
                {{ payment.sum.toFixed(2) }}
              </td>
              <td>{{ $root.parseDate(payment.created_at) }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="kt-content kt-grid__item kt-grid__item--fluid">
      <div class="kt-portlet kt-portlet--mobile">
        <div class="kt-portlet__head kt-portlet__head--lg">
          <div class="kt-portlet__head-label">
            <h3 class="kt-portlet__head-title">
              Список активированных промокодов
            </h3>
          </div>
        </div>
        <div class="kt-portlet__body">
          <table class="table table-striped- table-bordered table-hover table-checkable" id="promocodes">
            <thead>
            <tr>
              <th>ID</th>
              <th>Промокод</th>
              <th>Сумма</th>
              <th>Дата</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="promocode in info.promocodes" :key="promocode.id">
              <td>{{ promocode.id }}</td>
              <td>{{ promocode.promo.name }}</td>
              <td>
                {{ promocode.promo.sum.toFixed(2) }}
              </td>
              <td>{{ $root.parseDate(promocode.created_at) }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="kt-content kt-grid__item kt-grid__item--fluid">
      <div class="kt-portlet kt-portlet--mobile">
        <div class="kt-portlet__head kt-portlet__head--lg">
          <div class="kt-portlet__head-label">
            <h3 class="kt-portlet__head-title">
              Список выводов
            </h3>
          </div>
        </div>
        <div class="kt-portlet__body">
          <table class="table table-striped- table-bordered table-hover table-checkable" id="withdraws">
            <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Стоимость</th>
              <th>Статус</th>
              <th>Ошибка</th>
              <th>Дата</th>
              <th>Действие</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="withdraw in info.withdraws" :key="withdraw.id">
              <td>{{ withdraw.id }}</td>
              <td>
                  {{ withdraw.item.market_hash_name }}
              </td>
              <td>{{ withdraw.item.price.toFixed(2) }}$</td>
              <td>
                <span v-if="withdraw.status === 0">Ожидает</span>
                <span v-if="withdraw.status === 1" style="color: green">Получен</span>
                <span v-if="withdraw.status === 2" style="color: red">Ошибка</span>
              </td>
              <td>{{ withdraw.error_msg }}</td>
              <td>{{ $root.parseDate(withdraw.created_at) }}</td>
              <td>
                <a v-if="withdraw.status === 0" href="#" @click="returnWithdraw(withdraw.id)" class="btn btn-sm btn-clean btn-icon btn-icon-md returnWithdraw" title="Отменить">
                  <i class="la la-refresh"></i>
                </a>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="kt-content kt-grid__item kt-grid__item--fluid">
      <div class="kt-portlet kt-portlet--mobile">
        <div class="kt-portlet__head kt-portlet__head--lg">
          <div class="kt-portlet__head-label">
            <h3 class="kt-portlet__head-title">
              Обращения в поддержку
            </h3>
          </div>
        </div>
        <div class="kt-portlet__body">
          <table class="table table-striped- table-bordered table-hover table-checkable" id="tickets">
            <thead>
            <tr>
              <th>ID</th>
              <th>Проблема</th>
              <th>Последние сообщение от администратора</th>
              <th>Закрыт</th>
              <th>Дата</th>
              <th>Действие</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="ticket in info.tickets" :key="ticket.id">
              <td>
                {{ ticket.id }}
              </td>
              <td>
                {{ ticket.subject }}
              </td>
              <td>
                <span v-if="ticket.last_message_is_admin" style="color: green">Да</span>
                <span v-else style="color: red">Нет</span>
              </td>
              <td>
                <span v-if="ticket.is_closed" style="color: green">Да</span>
                <span v-else style="color: red">Нет</span>
              </td>
              <td>
                {{ $root.parseDate(ticket.created_at) }}
              </td>
              <td>
                <router-link tag="a" :to="{name: 'ticket', params: {id: ticket.id}}" class="btn btn-sm btn-clean btn-icon btn-icon-md" title="Открыть">
                  <i class="la la-edit"></i>
                </router-link>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="kt-content kt-grid__item kt-grid__item--fluid">
      <div class="kt-portlet kt-portlet--mobile">
        <div class="kt-portlet__head kt-portlet__head--lg">
          <div class="kt-portlet__head-label">
            <h3 class="kt-portlet__head-title">
              Список ставок
            </h3>
          </div>
        </div>
        <div class="kt-portlet__body">
          <table class="table table-striped- table-bordered table-hover table-checkable" id="bets">
            <thead>
            <tr>
              <th>ID</th>
              <th>ID игры</th>
              <th>Сумма ставки</th>
              <th>Кол-во предметов</th>
              <th>Авто-коэффициент</th>
              <th>Коэффициент вывода</th>
              <th>Выигрыш</th>
              <th>Статус</th>
              <th>Дата</th>
            </tr>
            </thead>
            <tbody>

            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="kt-content kt-grid__item kt-grid__item--fluid">
      <div class="kt-portlet kt-portlet--mobile">
        <div class="kt-portlet__head kt-portlet__head--lg">
          <div class="kt-portlet__head-label">
            <h3 class="kt-portlet__head-title">
              Список ставок CoinFlip
            </h3>
          </div>
        </div>
        <div class="kt-portlet__body">
          <table class="table table-striped- table-bordered table-hover table-checkable" id="coinflip">
            <thead>
            <tr>
              <th>ID</th>
              <th>Игрок #1</th>
              <th>Игрок #2</th>
              <th>Ставка игрока #1</th>
              <th>Ставка игрока #2</th>
              <th>Победитель</th>
              <th>Выигрыш</th>
              <th>Статус</th>
              <th>Дата</th>
            </tr>
            </thead>
            <tbody>

            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="kt-content kt-grid__item kt-grid__item--fluid">
      <div class="kt-portlet kt-portlet--mobile">
        <div class="kt-portlet__head kt-portlet__head--lg">
          <div class="kt-portlet__head-label">
            <h3 class="kt-portlet__head-title">
              Список ставок Wheel
            </h3>
          </div>
        </div>
        <div class="kt-portlet__body">
          <table class="table table-striped- table-bordered table-hover table-checkable" id="wheelBets">
            <thead>
            <tr>
              <th>ID</th>
              <th># игры</th>
              <th>Сумма ставки</th>
              <th>Цвет</th>
              <th>Выигрыш</th>
              <th>Дата</th>
            </tr>
            </thead>
            <tbody>

            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal fade" id="createInventoryItem" tabindex="-1" role="dialog" aria-labelledby="newLabel" style="display: none;" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Добавить предмет</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"></button>
          </div>
          <form class="kt-form-new" onclick="return false;">
            <div class="modal-body">
              <div class="form-group">
                <label>Предмет:</label>
                <select id="selectItem"></select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
              <button type="submit" class="btn btn-primary" v-on:click="createInventoryItem">Добавить</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: null,
      info: {}
    }
  },
  mounted() {
    this.getUser()
    this.loadInventoryItem()
  },
  methods: {
    async loadInventoryItem() {
      setTimeout(() => {
        $('#selectItem').select2({
          theme: 'bootstrap4',
          dropdownParent: $("#createInventoryItem"),
          ajax: {
            delay: 250,
            url: `${process.env.VUE_APP_BACKEND_URL}/api/admin/findItemsInInventory`,
            type: "GET",
            headers: {
              "Authorization": `Bearer ${this.$cookie.get('token')}`
            },
            data: function (params) {
              const query = {
                search: params.term,
                page: params.page || 0
              };

              return query;
            },
            processResults: function (data) {
              return {
                results: data.results,
                pagination: {
                  more: data.more
                }
              };
            }
          }
        });
      }, 500)
    },
    async getUser()  {
      this.$root.request('GET', `/admin/user/${this.$route.params.id}`)
          .then((data) => {
            this.user = data.user
            this.info = data.info

            this.user.is_ban_chat = Number(this.user.is_ban_chat)
            this.user.is_ban_withdraw = Number(this.user.is_ban_withdraw)

            setTimeout(() => {
              $('#inventory').dataTable({
                "order": [[0, 'desc']]
              });

              $('#withdraws').dataTable({
                "order": [[0, 'desc']]
              });

              $('#payments').dataTable({
                "order": [[0, 'desc']]
              });

              $('#promocodes').dataTable({
                "order": [[0, 'desc']]
              });

              $('#tickets').dataTable({
                "order": [[0, 'desc']]
              });

              this.getBets()
              this.getCoinFlipBets()
              this.getWheelBets()
            }, 100)
          })
          .catch(() => {
            this.$router.back()
          })
    },
    async save() {
      this.$root.request('POST', `/admin/user/${this.$route.params.id}`, {
        user: this.user
      })
          .then(() => {
            $.wnoty({
              type: 'success',
              message: 'Информация обновлена'
            })
          })
          .catch((e) => {
            $.wnoty({
              type: 'error',
              message: e
            })
          })
    },
    async deleteItem(id) {
      this.$root.request('POST', `/admin/user/inventory/del/${id}`)
          .then(() => {
            const index = this.info.inventory.findIndex(x => x.id === id)

            if (index > -1) {
              this.info.inventorySum -= this.info.inventory[index].item.price

              this.info.inventory.splice(index, 1)

              this.$forceUpdate()

              $('#inventory').dataTable().fnDestroy();

              this.$nextTick(function () {
                $('#inventory').DataTable();
              });
            }

            $.wnoty({
              type: 'success',
              message: 'Предмет удален'
            })
          })
          .catch((e) => {
            $.wnoty({
              type: 'error',
              message: e
            })
          })
    },
    async createInventoryItem() {
      this.$root.request('POST', `/admin/addItemToInventory`, {
        id: this.user.id,
        item_id: $('#selectItem option').last().val()
      })
        .then((data) => {
          this.info.inventory = data.inventory
          this.info.inventorySum = data.inventorySum

          this.$forceUpdate()

          $('#inventory').dataTable().fnDestroy();

          this.$nextTick(function () {
            $('#inventory').DataTable();
          });

          $.wnoty({
            type: 'success',
            message: 'Предмет добавлен'
          })
        })
        .catch((e) => {
          $.wnoty({
            type: 'error',
            message: e
          })
        })
    },
    async getBets() {
      const app = this

      $('#bets').dataTable().fnDestroy();

      $('#bets').DataTable({
        responsive: true,
        searchDelay: 500,
        processing: true,
        serverSide: true,
        ajax: {
          url: `${process.env.VUE_APP_BACKEND_URL}/api/admin/user/${this.user.id}/getBets`,
          type: "GET",
          headers: {
            "Authorization": `Bearer ${this.$cookie.get('token')}`
          }
        },
        columns: [
          { data: "id", searchable: true },
          { data: "crash_id", searchable: true },
          { data: "sum", searchable: true },
          { data: "items_length", searchable: true },
          { data: "auto_withdraw", searchable: true },
          { data: "multiplier", searchable: true },
          { data: "win", searchable: true },
          { data: "status", searchable: false,
            render: function (data, type, row) {
              if (row.status === 0) {
                return '<span>В игре</span>'
              } else if (row.status === 1) {
                return '<span style="color: green">Выигрыш</span>'
              } else if (row.status === 2) {
                return '<span style="color: red">Проигрыш</span>'
              }
            }
          },
          { data: "created_at", searchable: false,
            render: function (data, type, row) {
              return app.$root.parseDate(row.created_at)
            }
          }
        ],
        "language": {
          "processing": "Подождите...",
          "search": "Поиск:",
          "lengthMenu": "Показать _MENU_ записей",
          "info": "Записи с _START_ по _END_ из _TOTAL_ записей",
          "infoEmpty": "Записи с 0 до 0 из 0 записей",
          "infoFiltered": "(отфильтровано из _MAX_ записей)",
          "infoPostFix": "",
          "loadingRecords": "Загрузка записей...",
          "zeroRecords": "Записи отсутствуют.",
          "emptyTable": "В таблице отсутствуют данные",
          "paginate": {
            "first": "Первая",
            "previous": "Предыдущая",
            "next": "Следующая",
            "last": "Последняя"
          },
          "aria": {
            "sortAscending": ": активировать для сортировки столбца по возрастанию",
            "sortDescending": ": активировать для сортировки столбца по убыванию"
          }
        }
      });
    },
    async returnWithdraw(id) {
      this.$root.request('POST', `/admin/withdraws/${id}/return`)
          .then(() => {
            this.getUser()

            $.wnoty({
              type: 'success',
              message: 'Вывод отменен'
            })
          })
          .catch((e) => {
            $.wnoty({
              type: 'error',
              message: e
            })
          })
    },
    async getCoinFlipBets() {
      const app = this

      $('#coinflip').dataTable().fnDestroy();

      $('#coinflip').DataTable({
        responsive: true,
        searchDelay: 500,
        processing: true,
        serverSide: true,
        ajax: {
          url: `${process.env.VUE_APP_BACKEND_URL}/api/admin/user/${this.user.id}/getCoinFlipBets`,
          type: "GET",
          headers: {
            "Authorization": `Bearer ${this.$cookie.get('token')}`
          }
        },
        columns: [
          { data: "id", searchable: true },
          { data: "blue_id", searchable: true,
            render: function (data, type, row) {
              return row.blue_user === null ? '' : `<a href="/user/${row.blue_user.id}">${row.blue_user.username}</a>`
            }
          },
          { data: "green_id", searchable: true,
            render: function (data, type, row) {
              return row.green_user === null ? '' : `<a href="/user/${row.green_user.id}">${row.green_user.username}</a>`
            }
          },
          { data: "blue_sum", searchable: true },
          { data: "green_sum", searchable: true },
          { data: "winner_id", searchable: true,
            render: function (data, type, row) {
              return row.winner === null ? '' : `<a href="/user/${row.winner.id}">${row.winner.username}</a>`
            }
          },
          { data: "win", searchable: true },
          { data: "status", searchable: false,
            render: function (data, type, row) {
              if (row.status === 0) {
                return '<span>Ожидает соперника</span>'
              } else if (row.status === 1 || row.status === 2 || row.status === 3) {
                return '<span>Разыгрывается</span>'
              } else if (row.status === 4) {
                return '<span>Окончена</span>'
              }
            }
          },
          { data: "created_at", searchable: false,
            render: function (data, type, row) {
              return app.$root.parseDate(row.created_at)
            }
          }
        ],
        "language": {
          "processing": "Подождите...",
          "search": "Поиск:",
          "lengthMenu": "Показать _MENU_ записей",
          "info": "Записи с _START_ по _END_ из _TOTAL_ записей",
          "infoEmpty": "Записи с 0 до 0 из 0 записей",
          "infoFiltered": "(отфильтровано из _MAX_ записей)",
          "infoPostFix": "",
          "loadingRecords": "Загрузка записей...",
          "zeroRecords": "Записи отсутствуют.",
          "emptyTable": "В таблице отсутствуют данные",
          "paginate": {
            "first": "Первая",
            "previous": "Предыдущая",
            "next": "Следующая",
            "last": "Последняя"
          },
          "aria": {
            "sortAscending": ": активировать для сортировки столбца по возрастанию",
            "sortDescending": ": активировать для сортировки столбца по убыванию"
          }
        }
      });
    },
    async getWheelBets() {
      const app = this

      $('#wheelBets').dataTable().fnDestroy();

      $('#wheelBets').DataTable({
        responsive: true,
        searchDelay: 500,
        processing: true,
        serverSide: true,
        ajax: {
          url: `${process.env.VUE_APP_BACKEND_URL}/api/admin/user/${this.user.id}/getWheelBets`,
          type: "GET",
          headers: {
            "Authorization": `Bearer ${this.$cookie.get('token')}`
          }
        },
        columns: [
          { data: "id", searchable: true },
          { data: "wheel_id", searchable: true },
          { data: "sum", searchable: true },
          { data: "color", searchable: true },
          { data: "win", searchable: true },
          { data: "created_at", searchable: false,
            render: function (data, type, row) {
              return app.$root.parseDate(row.created_at)
            }
          }
        ],
        "language": {
          "processing": "Подождите...",
          "search": "Поиск:",
          "lengthMenu": "Показать _MENU_ записей",
          "info": "Записи с _START_ по _END_ из _TOTAL_ записей",
          "infoEmpty": "Записи с 0 до 0 из 0 записей",
          "infoFiltered": "(отфильтровано из _MAX_ записей)",
          "infoPostFix": "",
          "loadingRecords": "Загрузка записей...",
          "zeroRecords": "Записи отсутствуют.",
          "emptyTable": "В таблице отсутствуют данные",
          "paginate": {
            "first": "Первая",
            "previous": "Предыдущая",
            "next": "Следующая",
            "last": "Последняя"
          },
          "aria": {
            "sortAscending": ": активировать для сортировки столбца по возрастанию",
            "sortDescending": ": активировать для сортировки столбца по убыванию"
          }
        }
      });
    }
  },
}
</script>