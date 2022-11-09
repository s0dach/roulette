<template>
  <div>
    <div class="kt-subheader kt-grid__item" id="kt_subheader">
      <div class="kt-subheader__main">
        <h3 class="kt-subheader__title">Боты</h3>
      </div>
    </div>

    <div class="kt-content kt-grid__item kt-grid__item--fluid">
      <div class="kt-portlet kt-portlet--mobile">
        <div class="kt-portlet__head kt-portlet__head--lg">
          <div class="kt-portlet__head-label">
            <h3 class="kt-portlet__head-title">
              Список ботов
            </h3>
          </div>
          <div class="kt-portlet__head-toolbar">
            <div class="kt-portlet__head-wrapper">
              <div class="kt-portlet__head-actions">
                <a data-toggle="modal" href="#addBot" class="btn btn-success btn-elevate btn-icon-sm">
                  <i class="la la-plus"></i>
                  Добавить бота
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="kt-portlet__body">
          <table class="table table-striped- table-bordered table-hover table-checkable" id="users">
            <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Steam профиль</th>
              <th>Баланс</th>
              <th>Вывел</th>
              <th>Роль</th>
              <th>Действия</th>
            </tr>
            </thead>
            <tbody>

            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="kt-content kt-grid__item kt-grid__item--fluid" id="sendMessage">
      <div class="kt-portlet kt-portlet--mobile">
        <div class="kt-portlet__head kt-portlet__head--lg">
          <div class="kt-portlet__head-label">
            <h3 class="kt-portlet__head-title">
              Отправить сообщение
            </h3>
          </div>
        </div>
        <div class="kt-portlet__body">
          <form class="kt-form-new" onclick="return false;">
            <div class="modal-body">
              <div class="form-group">
                <label>Бот:</label>
                <select style="width: 100%;" id="selectBot"></select>
              </div>
              <div class="form-group">
                <label>Сообщение:</label>
                <input type="text" class="form-control" v-model="send.message">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-success" v-on:click="saveSendMessage">Сохранить сообщение</button>
              <button type="submit" class="btn btn-primary" v-on:click="sendMessage">Отправить</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="kt-content kt-grid__item kt-grid__item--fluid">
      <div class="kt-portlet kt-portlet--mobile">
        <div class="kt-portlet__head kt-portlet__head--lg">
          <div class="kt-portlet__head-label">
            <h3 class="kt-portlet__head-title">
              Список сообщений
            </h3>
          </div>
        </div>
        <div class="kt-portlet__body">
          <table class="table table-striped- table-bordered table-hover table-checkable" id="messages">
            <thead>
            <tr>
              <th>ID</th>
              <th>Сообщение</th>
              <th>Действия</th>
            </tr>
            </thead>
            <tbody>

            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal fade" id="addBot" tabindex="-1" role="dialog" aria-labelledby="newLabel" style="display: none;"
         aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Создать бота</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"></button>
          </div>
          <form class="kt-form-new" onclick="return false;">
            <div class="modal-body">
              <div class="form-group">
                <label>SteamID64:</label>
                <input type="text" class="form-control" v-model="bot.steamId">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
              <button type="submit" class="btn btn-primary" v-on:click="createBot">Создать</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div class="modal fade" id="addMessage" tabindex="-1" role="dialog" aria-labelledby="newLabel"
         style="display: none;" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Создать сообщение</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"></button>
          </div>
          <form class="kt-form-new" onclick="return false;">
            <div class="modal-body">
              <div class="form-group">
                <label>Сообщение:</label>
                <input type="text" class="form-control" v-model="message">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
              <button type="submit" class="btn btn-primary" v-on:click="createMessage">Создать</button>
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
      bot: {
        steamId: null
      },
      message: '',
      send: {
        message: ''
      }
    }
  },
  mounted() {
    const app = this;

    this.loadTable()
    this.loadMessagesTable()
    this.loadSelectBots()

    setTimeout(() => {
      $(document).on('click', '.deleteMessage', function () {
        app.deleteMessage(this);
      });
      $(document).on('click', '.pauseMessage', function () {
        app.pauseMessage($(this).attr('data-id'), 1);
      });
      $(document).on('click', '.unPauseMessage', function () {
        app.pauseMessage($(this).attr('data-id'), 0);
      });
    })
  },
  methods: {
    async loadTable() {
      const app = this;
      const table = $('#users');

      table.dataTable().fnDestroy();

      table.DataTable({
        responsive: true,
        searchDelay: 500,
        processing: true,
        serverSide: true,
        ajax: {
          url: `${process.env.VUE_APP_BACKEND_URL}/api/admin/bots`,
          type: "GET",
          headers: {
            "Authorization": `Bearer ${this.$cookie.get('token')}`
          }
        },
        columns: [
          {data: "id", searchable: true},
          {data: "username", searchable: true},
          {
            data: null, searchable: false,
            render: function (data, type, row) {
              return '<a href="https://steamcommunity.com/profiles/' + row.steamId + '/">Профиль Steam</a>'
            }
          },
          {data: "balance", searchable: true},
          {data: "withdraw", searchable: true},
          {
            data: "role", searchable: false,
            render: function (data, type, row) {
              if (row.role === 'user') {
                return '<span>Пользователь</span>'
              } else if (row.role === 'admin') {
                return '<span>Администратор</span>'
              } else if (row.role === 'moderator') {
                return '<span>Модератор</span>'
              }
            }
          },
          {
            data: null, searchable: false,
            render: function (data, type, row) {
              return '                                <a class="btn btn-sm btn-clean btn-icon btn-icon-md editUser" data-id="' + row.id + '" title="Редактировать">\n' +
                  '                                    <i class="la la-edit"></i>\n' +
                  '                                </a>'
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

      $(document).on('click', '.editUser', function () {
        app.edit($(this).attr('data-id'));
      });
    },
    async loadMessagesTable() {
      const table = $('#messages');

      table.dataTable().fnDestroy();

      table.DataTable({
        responsive: true,
        searchDelay: 500,
        processing: true,
        serverSide: true,
        ajax: {
          url: `${process.env.VUE_APP_BACKEND_URL}/api/admin/bots/messages`,
          type: "GET",
          headers: {
            "Authorization": `Bearer ${this.$cookie.get('token')}`
          }
        },
        columns: [
          {data: "id", searchable: true},
          {data: "message", searchable: true},
          {
            data: null, searchable: false,
            render: function (data, type, row) {
              let block;

              if (row.is_paused) {
                block = '<a class="btn btn-sm btn-clean btn-icon btn-icon-md unPauseMessage" data-id="' + row.id + '" title="Запустить">\n' +
                    '<i class="la la-play"></i>\n' +
                    '</a>'
              } else {
                block = '<a class="btn btn-sm btn-clean btn-icon btn-icon-md pauseMessage" data-id="' + row.id + '" title="Остановить">\n' +
                    '<i class="la la-pause"></i>\n' +
                    '</a>'
              }

              return '<a class="btn btn-sm btn-danger btn-icon btn-icon-md deleteMessage" data-id="' + row.id + '" title="Удалить">\n' +
                  '<i class="la la-trash"></i>\n' +
                  '</a>' +
                  `<span id="actions_${row.id}">${block}</span>`
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
    async loadSelectBots() {
      setTimeout(() => {
        $('#selectBot').select2({
          theme: 'bootstrap4',
          dropdownParent: $("#sendMessage"),
          ajax: {
            delay: 250,
            url: `${process.env.VUE_APP_BACKEND_URL}/api/admin/findBots`,
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
    async edit(id) {
      this.$router.replace({
        name: 'user',
        params: {
          id: id
        }
      });
    },
    async createBot() {
      this.$root.request('POST', '/admin/bots/create', {
        steamId: this.bot.steamId
      }).then(() => {
        $.wnoty({
          type: 'success',
          message: 'Бот добавлен'
        })

        this.loadTable();
      }).catch((e) => {
        $.wnoty({
          type: 'error',
          message: e
        })
      })
    },
    async deleteMessage(block) {
      this.$root.request('POST', '/admin/bots/messages/delete', {
        id: $(block).attr('data-id')
      }).then(() => {
        $.wnoty({
          type: 'success',
          message: 'Сообщение удалено'
        })

        $($($(block).parent()).parent()).remove()
      }).catch((e) => {
        $.wnoty({
          type: 'error',
          message: e
        })
      })
    },
    async saveSendMessage() {
      this.message = this.send.message;

      this.createMessage();
    },
    async sendMessage() {
      this.$root.request('POST', '/admin/bots/sendMessage', {
        bot_id: $('#selectBot option').last().val(),
        message: this.send.message
      }).then(() => {
        $.wnoty({
          type: 'success',
          message: 'Сообщение отправлено'
        })

        $('#sendMessage').modal('hide')
        this.send.message = '';
      }).catch((e) => {
        $.wnoty({
          type: 'error',
          message: e
        })
      })
    },
    async createMessage() {
      this.$root.request('POST', '/admin/bots/messages/create', {
        message: this.message
      }).then(() => {
        $.wnoty({
          type: 'success',
          message: 'Сообщение добавлено'
        })

        $('#addMessage').modal('hide')
        this.message = '';
        this.loadMessagesTable();
      }).catch((e) => {
        $.wnoty({
          type: 'error',
          message: e
        })
      })
    },
    async pauseMessage(id, isPaused) {
      this.$root.request('POST', '/admin/bots/messages/pause', {
        id,
        is_paused: isPaused
      }).then(() => {
        if (isPaused) {
          $.wnoty({
            type: 'success',
            message: 'Сообщение остановлено'
          })
        } else {
          $.wnoty({
            type: 'success',
            message: 'Сообщение запущено'
          })
        }

        let block;

        if (isPaused) {
          block = '<a class="btn btn-sm btn-clean btn-icon btn-icon-md unPauseMessage" data-id="' + id + '" title="Запустить">\n' +
              '<i class="la la-play"></i>\n' +
              '</a>'
        } else {
          block = '<a class="btn btn-sm btn-clean btn-icon btn-icon-md pauseMessage" data-id="' + id + '" title="Остановить">\n' +
              '<i class="la la-pause"></i>\n' +
              '</a>'
        }

        $(`#actions_${id}`).html(block)
      }).catch((e) => {
        $.wnoty({
          type: 'error',
          message: e
        })
      })
    }
  }
}
</script>