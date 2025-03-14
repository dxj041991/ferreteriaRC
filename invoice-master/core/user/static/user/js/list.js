var tblUsers;
var fv;
var user = {
    model: {},
    list: function () {
        tblUsers = $('#data').DataTable({
            autoWidth: false,
            destroy: true,
            ajax: {
                url: pathname,
                type: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                data: {
                    'action': 'search'
                },
                dataSrc: ""
            },
            columns: [
                {data: "id"},
                {data: "names"},
                {data: "username"},
                {data: "is_active"},
                {data: "image"},
                {data: "groups"},
                {data: "id"},
            ],
            columnDefs: [
                {
                    targets: [-3],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        return '<img alt="" class="img-fluid mx-auto d-block" src="' + data + '" width="20px" height="20px">';
                    }
                },
                {
                    targets: [-4],
                    class: 'text-center',
                    render: function (data, type, row) {
                        if (data) {
                            return '<span class="badge badge-success badge-pill">Activo</span>';
                        }
                        return '<span class="badge badge-danger badge-pill">Inactivo</span>';
                    }
                },
                {
                    targets: [-2],
                    class: 'text-center',
                    render: function (data, type, row) {
                        var content = '';
                        row.groups.forEach(function (value, index, array) {
                            content += '<span class="badge badge-success badge-pill">' + value.name + '</span> ';
                        });
                        return content;
                    }
                },
                {
                    targets: [-1],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        var content = '<a class="btn btn-warning btn-xs btn-flat" data-toggle="tooltip" title="Editar" href="' + pathname + 'update/' + row.id + '/"><i class="fas fa-edit"></i></a> ';
                        content += '<a class="btn btn-danger btn-xs btn-flat" data-toggle="tooltip" title="Eliminar" href="' + pathname + 'delete/' + row.id + '/"><i class="fas fa-trash"></i></a> ';
                        content += '<a class="btn btn-info btn-xs btn-flat" data-toggle="tooltip" title="Logearse al sistema"  rel="login_with_user"><i class="fas fa-globe"></i></a> ';
                        content += '<a class="btn btn-secondary btn-xs btn-flat" data-toggle="tooltip" title="Resetear password"  rel="reset_password"><i class="fas fa-unlock-alt"></i></a> ';
                        content += '<a class="btn btn-success btn-xs btn-flat" data-toggle="tooltip" title="Actualizar password" rel="update_password"><i class="fas fa-lock"></i></a>';
                        return content;
                    }
                },
            ],
            initComplete: function (settings, json) {
                $('[data-toggle="tooltip"]').tooltip();
                $(this).wrap('<div class="dataTables_scroll"><div/>');
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', function (e) {
    fv = FormValidation.formValidation(document.getElementById('frmForm'), {
            locale: 'es_ES',
            localization: FormValidation.locales.es_ES,
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                submitButton: new FormValidation.plugins.SubmitButton(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
                icon: new FormValidation.plugins.Icon({
                    valid: 'fa fa-check',
                    invalid: 'fa fa-times',
                    validating: 'fa fa-refresh',
                }),
            },
            fields: {
                password: {
                    validators: {
                        notEmpty: {
                            message: 'El password es requerido'
                        },
                    }
                },
            },
        }
    )
        .on('core.element.validated', function (e) {
            if (e.valid) {
                const groupEle = FormValidation.utils.closest(e.element, '.form-group');
                if (groupEle) {
                    FormValidation.utils.classSet(groupEle, {
                        'has-success': false,
                    });
                }
                FormValidation.utils.classSet(e.element, {
                    'is-valid': false,
                });
            }
            const iconPlugin = fv.getPlugin('icon');
            const iconElement = iconPlugin && iconPlugin.icons.has(e.element) ? iconPlugin.icons.get(e.element) : null;
            iconElement && (iconElement.style.display = 'none');
        })
        .on('core.validator.validated', function (e) {
            if (!e.result.valid) {
                const messages = [].slice.call(fv.form.querySelectorAll('[data-field="' + e.field + '"][data-validator]'));
                messages.forEach((messageEle) => {
                    const validator = messageEle.getAttribute('data-validator');
                    messageEle.style.display = validator === e.validator ? 'block' : 'none';
                });
            }
        })
        .on('core.form.valid', function () {
            var url_refresh = pathname;
            var params = new FormData(fv.form);
            params.append('action', 'update_password');
            params.append('id', user.model.id);
            var args = {
                'params': params,
                'content': '¿Estas seguro de cambiar la clave?',
                'success': function () {
                    alert_sweetalert({
                        'title': 'Notificación',
                        'message': 'La clave fue cambiada exitosamente',
                        'callback': function () {
                            location.href = url_refresh;
                        }
                    });
                }
            };
            submit_with_formdata(args);
        });
});

$(function () {
    user.list();

    $('#data tbody')
        .off()
        .on('click', 'a[rel="reset_password"]', function () {
            var tr = tblUsers.cell($(this).closest('td, li')).index(),
                row = tblUsers.row(tr.row).data();
            var params = new FormData(fv.form);
            params.append('action', 'reset_password');
            params.append('id', row.id);
            var args = {
                'params': params,
                'content': '¿Estas seguro de resetear la clave?',
                'success': function () {
                    alert_sweetalert({
                        'title': 'Notificación',
                        'message': 'La clave fue reseteado exitosamente',
                        'callback': function () {
                            location.reload();
                        }
                    });
                }
            };
            submit_with_formdata(args);
        })
        .on('click', 'a[rel="login_with_user"]', function () {
            var tr = tblUsers.cell($(this).closest('td, li')).index(),
                row = tblUsers.row(tr.row).data();
            var params = new FormData();
            params.append('action', 'login_with_user');
            params.append('id', row.id);
            var args = {
                'params': params,
                'content': '¿Estas seguro de iniciar sesión con este usuario?',
                'success': function () {
                    alert_sweetalert({
                        'title': 'Notificación',
                        'message': 'Has ingresado con éxito al sistema',
                        'callback': function () {
                            location.href = '/';
                        }
                    });
                }
            };
            submit_with_formdata(args);
        })
        .on('click', 'a[rel="update_password"]', function () {
            var tr = tblUsers.cell($(this).closest('td, li')).index();
            user.model = tblUsers.row(tr.row).data();
            $('#myModalChangePasswordByUser').modal('show');
        })

    $('#myModalChangePasswordByUser').on('hidden.bs.modal', function () {
        fv.resetForm(true);
    });
});

