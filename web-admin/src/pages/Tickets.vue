<template>
  <div>
    <div class="kt-subheader kt-grid__item" id="kt_subheader">
      <div class="kt-subheader__main">
        <h3 class="kt-subheader__title">Поддержка</h3>
      </div>
    </div>

    <div class="kt-content kt-grid__item kt-grid__item--fluid" id="kt_content">
      <div class="kt-portlet kt-portlet--mobile">
        <div class="kt-portlet__head kt-portlet__head--lg">
          <div class="kt-portlet__head-label">
            <h3 class="kt-portlet__head-title">
              Список обращений
            </h3>
          </div>
        </div>
        <div class="kt-portlet__body">
          <table class="table table-striped- table-bordered table-hover table-checkable" id="tickets">
            <thead>
            <tr>
              <th>ID</th>
              <th>Пользователь</th>
              <th>Проблема</th>
              <th>Последние сообщение от администратора</th>
              <th>Закрыт</th>
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
      const app =  this;
      const table = $('#tickets');

      table.dataTable().fnDestroy();

      table.DataTable({
        responsive: true,
        searchDelay: 500,
        processing: true,
        serverSide: true,
        ajax: {
          url: `${process.env.VUE_APP_BACKEND_URL}/api/admin/tickets`,
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
          { data: "subject", searchable: true },
          { data: "last_message_is_admin", searchable: true,
            render: function (data, type, row) {
              if (row.last_message_is_admin) {
                return '<span style="color: green">Да</span>'
              } else {
                return '<span style="color: red">Нет</span>'
              }
            }
          },
          { data: "is_closed", searchable: true,
            render: function (data, type, row) {
              if (row.is_closed) {
                return '<span style="color: green">Да</span>'
              } else {
                return '<span style="color: red">Нет</span>'
              }
            }
          },
          { data: "created_at", searchable: true,
            render: function (data, type, row) {
              return app.$root.parseDate(row.created_at)
            }
          },
          { data: null, searchable: false,
            render: function (data, type, row) {
              return '<a class="btn btn-sm btn-clean btn-icon btn-icon-md openTicket" data-id="'+row.id+'" title="Открыть">\n' +
                  '<i class="la la-edit"></i>\n' +
                  '</a>'
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

      $(document).on('click', '.openTicket', function() {
        app.open($(this).attr('data-id'));
      });
    },
    async open(id) {
      this.$router.replace({
        name: 'ticket',
        params: {
          id: id
        }
      });
    }
  }
}
</script>