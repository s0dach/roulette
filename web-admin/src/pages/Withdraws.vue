<template>
  <div>
    <div class="kt-subheader kt-grid__item" id="kt_subheader">
      <div class="kt-subheader__main">
        <h3 class="kt-subheader__title">Выводы</h3>
      </div>
    </div>

    <div class="kt-content kt-grid__item kt-grid__item--fluid" id="kt_content">
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
              <th>Пользователь</th>
              <th>Предмет</th>
              <th>Стоимость покупки</th>
              <th>Статус</th>
              <th>Ошибка</th>
              <th>Дата</th>
              <th>Действие</th>
            </tr>
            </thead>
            <tbody>

            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  mounted() {
    this.loadTable()
  },
  methods: {
    async loadTable() {
      const app = this
      const table = $('#withdraws');

      table.dataTable().fnDestroy();

      table.DataTable({
        responsive: true,
        searchDelay: 500,
        processing: true,
        serverSide: true,
        ajax: {
          url: `${process.env.VUE_APP_BACKEND_URL}/api/admin/withdraws`,
          type: "GET",
          headers: {
            "Authorization": `Bearer ${this.$cookie.get('token')}`
          }
        },
        columns: [
          { data: "id", searchable: true },
          { data: "user_id", searchable: true,
            render: function (data, type, row) {
              return `<a href="/user/${row.user_id}">${row.user.username}</a>`
            }
          },
          { data: "item_id", searchable: true,
            render: function (data, type, row) {
              return `${row.item.market_hash_name}`
            }
          },
          { data: "price", searchable: true },
          { data: "status", searchable: true,
            render: function (data, type, row) {
              if (row.status === 0) {
                return 'Ожидает'
              } else if (row.status === 1) {
                return '<span style="color: green">Выведено</span>'
              } else if (row.status === 2) {
                return '<span style="color: red">Ошибка</span>'
              }
            }
          },
          { data: "error_msg", searchable: true },
          { data: "created_at", searchable: true,
            render: function (data, type, row) {
              return app.$root.parseDate(row.created_at)
            }
          },
          { data: null, searchable: false,
            render: function (data, type, row) {
              if (row.status === 0) {
                return '<a class="btn btn-sm btn-clean btn-icon btn-icon-md returnWithdraw" data-id="' + row.id + '" title="Отменить">\n' +
                    '<i class="la la-refresh"></i>\n' +
                    '</a>'
              } else {
                return ''
              }
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

      $(document).on('click', '.returnWithdraw', function() {
        app.returnWithdraw($(this).attr('data-id'));
      });
    },
    async returnWithdraw(id) {
      this.$root.request('POST', `/admin/withdraws/${id}/return`)
          .then(() => {
            this.loadTable()

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
    }
  }
}
</script>