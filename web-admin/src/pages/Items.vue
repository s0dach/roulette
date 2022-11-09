<template>
  <div>
    <div class="kt-subheader kt-grid__item" id="kt_subheader">
      <div class="kt-subheader__main">
        <h3 class="kt-subheader__title">Предметы</h3>
      </div>
    </div>

    <div class="kt-content kt-grid__item kt-grid__item--fluid" id="kt_content">
      <div class="kt-portlet kt-portlet--mobile">
        <div class="kt-portlet__head kt-portlet__head--lg">
          <div class="kt-portlet__head-label">
            <h3 class="kt-portlet__head-title">
              Список предметов
            </h3>
          </div>
          <div class="kt-portlet__head-toolbar">
            <div class="kt-portlet__head-wrapper">
              <div class="kt-portlet__head-actions">
                <a href="#" @click="refreshPrices" class="btn btn-success btn-elevate btn-icon-sm">
                  <i class="la la-refresh"></i>
                  Обновить цены
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="kt-portlet__body">
          <table class="table table-striped- table-bordered table-hover table-checkable" id="items">
            <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Стоимость</th>
              <th>Действия</th>
            </tr>
            </thead>
            <tbody>

            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="editItem" class="modal fade" id="editItem" tabindex="-1" role="dialog" aria-labelledby="newLabel" style="display: none;" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Редактировать предмет</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"></button>
          </div>
          <form class="kt-form-new" onclick="return false;">
            <div class="modal-body">
              <div class="form-group">
                <label>Название:</label>
                <input type="text" class="form-control" v-model="editItem.market_hash_name" disabled>
              </div>
              <div class="form-group">
                <label>Стоимость:</label>
                <input type="text" class="form-control" v-model="editItem.price">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
              <button type="submit" class="btn btn-primary" v-on:click="saveItem">Сохранить</button>
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
      editItem: null
    }
  },
  mounted() {
    this.loadTable()
  },
  methods: {
    async loadTable() {
      const app =  this;
      const table = $('#items');

      table.dataTable().fnDestroy();

      table.DataTable({
        responsive: true,
        searchDelay: 500,
        processing: true,
        serverSide: true,
        ajax: {
          url: `${process.env.VUE_APP_BACKEND_URL}/api/admin/items`,
          type: "GET",
          headers: {
            "Authorization": `Bearer ${this.$cookie.get('token')}`
          }
        },
        columns: [
          { data: "id", searchable: true },
          { data: "market_hash_name", searchable: true },
          { data: "price", searchable: true },
          { data: null, searchable: false,
            render: function (data, type, row) {
              return '<a class="btn btn-sm btn-clean btn-icon btn-icon-md editUser" data-id="'+row.id+'" title="Редактировать">\n' +
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

      $(document).on('click', '.editUser', function() {
        app.edit($(this).attr('data-id'));
      });
    },
    async edit(id) {
      this.$root.request('GET', `/admin/items/${id}`)
          .then((item) => {
            this.editItem = item

            setTimeout(() => {
              $('#editItem').modal('show')
            }, 100)
          })
          .catch((e) => {
            $.wnoty({
              type: 'error',
              message: e
            })
          })
    },
    async saveItem() {
      this.$root.request('POST', `/admin/items/${this.editItem.id}/save`, {
        price: this.editItem.price
      })
          .then(() => {
            $('#editItem').modal('hide')

            this.loadTable()

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
    async refreshPrices() {
      this.$root.request('POST', `/admin/items/prices/refresh`)
          .then(() => {
            $.wnoty({
              type: 'success',
              message: 'Обновление цен запланировано'
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