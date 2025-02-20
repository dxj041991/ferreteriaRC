var btnSearchRUC;
var input_ruc;
var provider = {
    searchRUC: function () {
        execute_ajax_request({
            'params': {
                'action': 'search_ruc_in_sri',
                'ruc': input_ruc.val()
            },
            'beforeSend': function () {
                $('input[name="name"]').val('');
            },
            'success': function (request) {
                $('input[name="name"]').val(request.razonSocial);
                var content = '<dl>';
                Object.entries(request).forEach(([key, value]) => {
                    content += '<dt>' + key.toUpperCase() + '</dt>';
                    if (typeof (value) == "object") {
                        content += '<dd>' + JSON.stringify(value) + '</dd>'
                    } else {
                        content += '<dd>' + value + '</dd>'
                    }
                });
                $('#details').html(content);
                $('#myModalSearchRUC').modal('show');
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', function (e) {
    const fv = FormValidation.formValidation(document.getElementById('frmForm'), {
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
                name: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 2,
                        },
                        remote: {
                            url: pathname,
                            data: function () {
                                return {
                                    name: fv.form.querySelector('[name="name"]').value,
                                    field: 'name',
                                    action: 'validate_data'
                                };
                            },
                            message: 'El nombre ya se encuentra registrado',
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': csrftoken
                            },
                        }
                    }
                },
                ruc: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 13
                        },
                        digits: {},
                        callback: {
                            message: 'El número de ruc es incorrecto',
                            callback: function (input) {
                                return validate_dni_ruc(input.value);
                            },
                        },
                        remote: {
                            url: pathname,
                            data: function () {
                                return {
                                    ruc: fv.form.querySelector('[name="ruc"]').value,
                                    field: 'ruc',
                                    action: 'validate_data'
                                };
                            },
                            message: 'El número de ruc ya se encuentra registrado',
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': csrftoken
                            },
                        },
                    }
                },
                mobile: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 10
                        },
                        digits: {},
                        remote: {
                            url: pathname,
                            data: function () {
                                return {
                                    mobile: fv.form.querySelector('[name="mobile"]').value,
                                    field: 'mobile',
                                    action: 'validate_data'
                                };
                            },
                            message: 'El número de teléfono ya se encuentra registrado',
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': csrftoken
                            },
                        }
                    }
                },
                email: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 5
                        },
                        regexp: {
                            regexp: /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/i,
                            message: 'El formato email no es correcto'
                        },
                        remote: {
                            url: pathname,
                            data: function () {
                                return {
                                    email: fv.form.querySelector('[name="email"]').value,
                                    field: 'email',
                                    action: 'validate_data'
                                };
                            },
                            message: 'El email ya se encuentra registrado',
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': csrftoken
                            },
                        }
                    }
                },
                address: {
                    validators: {
                        // stringLength: {
                        //     min: 4,
                        // }
                    }
                }
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
            var args = {
                'params': new FormData(fv.form),
                'form': fv.form
            };

            if (window.opener) {
                args['success'] = function (request) {
                    localStorage.setItem('provider', JSON.stringify(request));
                    window.close();
                }
            }

            submit_with_formdata(args);
        });
});

$(function () {
    btnSearchRUC = $('.btnSearchRUC');
    input_ruc = $('input[name="ruc"]');

    input_ruc
        .on('keyup', function () {
            var ruc = $(this).val();
            btnSearchRUC.prop('disabled', ruc.length < 13);
        })
        .on('keypress', function (e) {
            return validate_text_box({'event': e, 'type': 'numbers'});
        });

    $('input[name="mobile"]').on('keypress', function (e) {
        return validate_text_box({'event': e, 'type': 'numbers'});
    });

    btnSearchRUC.on('click', function () {
        provider.searchRUC();
    });

    $('i[data-field="search_ruc_sri"]').hide();
});