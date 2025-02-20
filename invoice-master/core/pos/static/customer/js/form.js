var fv;
var input_birthdate;
var input_dni;
var btnSearchDNI;

var client = {
    searchDNI: function () {
        execute_ajax_request({
            'params': {
                'action': 'search_ruc_in_sri',
                'dni': input_dni.val()
            },
            'beforeSend': function () {
                $('input[name="names"]').val('');
            },
            'success': function (request) {
                $('input[name="names"]').val(request.razonSocial);
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
                $('#myModalSearchDNI').modal('show');
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
                names: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 2,
                        },
                    }
                },
                dni: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 10
                        },
                        digits: {},
                        callback: {
                            message: 'El número de cedula o ruc es incorrecto',
                            callback: function (input) {
                                return validate_dni_ruc(input.value);
                            },
                        },
                        remote: {
                            url: pathname,
                            data: function () {
                                return {
                                    dni: fv.form.querySelector('[name="dni"]').value,
                                    field: 'dni',
                                    action: 'validate_data'
                                };
                            },
                            message: 'El número de cédula ya se encuentra registrado',
                            method: 'POST',
                            headers: {
                                'X-CSRFToken': csrftoken
                            },
                        }
                    }
                },
                mobile: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 7
                        },
                        digits: {}
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
                        }
                    }
                },
                address: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 4,
                        }
                    }
                },
                birthdate: {
                    validators: {
                        notEmpty: {
                            message: 'La fecha es obligatoria'
                        },
                        date: {
                            format: 'YYYY-MM-DD',
                            message: 'La fecha no es válida'
                        }
                    },
                },
                image: {
                    validators: {
                        file: {
                            extension: 'jpeg,jpg,png',
                            type: 'image/jpeg,image/png',
                            maxFiles: 1,
                            message: 'Introduce una imagen válida'
                        }
                    }
                },
                identification_type: {
                    validators: {
                        notEmpty: {
                            message: 'Seleccione un item'
                        }
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
            var args = {
                'params': new FormData(fv.form),
                'form': fv.form
            };

            if (window.opener) {
                args['success'] = function (request) {
                    localStorage.setItem('customer', JSON.stringify(request));
                    window.close();
                }
            }

            submit_with_formdata(args);
        });
});

$(function () {
    input_dni = $('input[name="dni"]');
    btnSearchDNI = $('.btnSearchDNI');

    input_birthdate = $('input[name="birthdate"]');

    $('.select2').select2({
        theme: 'bootstrap4',
        language: 'es'
    });

    input_birthdate.datetimepicker({
        useCurrent: false,
        format: 'YYYY-MM-DD',
        locale: 'es',
        keepOpen: false,
    });

    input_birthdate.on('change.datetimepicker', function (e) {
        fv.revalidateField('birthdate');
    });

    $('input[name="names"]').on('keypress', function (e) {
        return validate_text_box({'event': e, 'type': 'letters'});
    });

    input_dni
        .on('keyup', function () {
            var dni = $(this).val();
            btnSearchDNI.prop('disabled', dni.length < 10);
        })
        .on('keypress', function (e) {
            return validate_text_box({'event': e, 'type': 'numbers'});
        });

    $('input[name="mobile"]').on('keypress', function (e) {
        return validate_text_box({'event': e, 'type': 'numbers'});
    });

    btnSearchDNI.on('click', function () {
        client.searchDNI();
    });
});