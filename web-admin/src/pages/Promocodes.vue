<template>
  <div>
    <div class="kt-subheader kt-grid__item" id="kt_subheader">
      <div class="kt-subheader__main">
        <h3 class="kt-subheader__title">Промокоды</h3>
      </div>
    </div>

    <div class="kt-content kt-grid__item kt-grid__item--fluid" id="kt_content">
      <div class="kt-portlet kt-portlet--mobile">
        <div class="kt-portlet__head kt-portlet__head--lg">
          <div class="kt-portlet__head-label">
            <h3 class="kt-portlet__head-title">
              Список промокодов
            </h3>
          </div>
          <div class="kt-portlet__head-toolbar">
            <div class="kt-portlet__head-wrapper">
              <div class="kt-portlet__head-actions">
                <a data-toggle="modal" href="#addPromocode" class="btn btn-success btn-elevate btn-icon-sm">
                  <i class="la la-plus"></i>
                  Добавить промокод
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="kt-portlet__body">
          <table class="table table-striped- table-bordered table-hover table-checkable" id="promocodes">
            <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Сумма</th>
              <th>Использовано</th>
              <th>Кол-во</th>
              <th>Дата окончания</th>
              <th>Действия</th>
            </tr>
            </thead>
            <tbody>

            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal fade" id="addPromocode" tabindex="-1" role="dialog" aria-labelledby="newLabel" style="display: none;" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Создать промокод</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"></button>
          </div>
          <form class="kt-form-new" onclick="return false;">
            <div class="modal-body">
              <div class="form-group">
                <label>Название:</label>
                <input class="form-control" v-model="newItem.name" type="text" name="name">
              </div>
              <div class="form-group">
                <label>Сумма:</label>
                <input class="form-control" v-model="newItem.sum" type="number" name="sum">
              </div>
              <div class="form-group">
                <label>Максимальное кол-во активаций:</label>
                <input class="form-control" v-model="newItem.max" type="number" name="max">
              </div>
              <div class="form-group">
                <label>Дата окончания:</label>
                <div class="input-group date" id="datetimepicker">
                  <input type="text" class="form-control"/>
                  <span class="input-group-addon">
                    <i class="glyphicon glyphicon-calendar"></i>
                  </span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
              <button type="submit" class="btn btn-primary" v-on:click="createPromocode">Создать</button>
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
      newItem: {
        name: '',
        sum: '',
        max: null,
        end_time: ''
      }
    }
  },
  mounted() {
    const app = this;

    this.loadTable()

    $('#datetimepicker').datetimepicker({
      locale: 'ru'
    });

    setTimeout(() => {
      $(document).on('click', '.deletePromocode', function () {
        app.delete($(this).attr('data-id'));
      });
    })
  },
  methods: {
    async loadTable() {
      const app = this;
      const table = $('#promocodes');

      table.dataTable().fnDestroy();

      table.DataTable({
        responsive: true,
        searchDelay: 500,
        processing: true,
        serverSide: true,
        ajax: {
          url: `${process.env.VUE_APP_BACKEND_URL}/api/admin/promocodes`,
          type: "GET",
          headers: {
            "Authorization": `Bearer ${this.$cookie.get('token')}`
          }
        },
        columns: [
          { data: "id", searchable: true },
          { data: "name", searchable: true },
          { data: "sum", searchable: true },
          { data: "used", searchable: true },
          { data: "max", searchable: true,
            render: function (data, type, row) {
              if (row.max !== null) {
                return row.max
              } else {
                return ''
              }
            }
          },
          { data: "end_time", searchable: true,
            render: function (data, type, row) {
              if (row.end_time !== null) {
                return app.$root.parseDate(row.end_time)
              } else {
                return ''
              }
            }
          },
          { data: null, searchable: true,
            render: function (data, type, row) {
              return '<a style="cursor: pointer" class="btn btn-sm btn-danger btn-icon btn-icon-md deletePromocode" data-id="'+row.id+'" title="Удалить">\n' +
                  '<i class="la la-trash"></i>\n' +
                  '</a>'
            }
          },
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
    async delete(id) {
      this.$root.request('POST', `/admin/promocodes/${id}/del`)
          .then(() => {
            this.loadTable()

            $.wnoty({
              type: 'success',
              message: 'Промокод удален'
            })
          })
          .catch((e) => {
            $.wnoty({
              type: 'error',
              message: e
            })
          })
    },
    async createPromocode() {
      if (typeof $('#datetimepicker').data('date') !== 'undefined') {
        this.newItem.end_time = $('#datetimepicker').data('date')
      } else {
        this.newItem.end_time = null
      }

      this.$root.request('POST', '/admin/promocodes/create', {
          item: this.newItem
      }).then(() => {
        $('#addPromocode').modal('hide');

        this.newItem = {
          name: '',
          sum: '',
          max: null,
          end_time: ''
        }

        this.loadTable()

        $.wnoty({
          type: 'success',
          message: 'Промокод создан'
        })
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