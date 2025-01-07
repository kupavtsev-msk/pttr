let clicked_t = new Date().getTime();
$(document).ready(function($) {
    let main_canvas = new Canvas($('#main-canvas'));//обьявляем обьект

    $('#submenu-1-1, #submenu-1-3').on('click', 'a.icon-point', function(e) {
        e.preventDefault();
        main_canvas.addImage($(this).attr('href'));
        $(document).trigger('click');
        return false;
    });

    $('#clearCanvas').click(function() {
        main_canvas.clear();
        $(document).trigger('click');
        return false;
    });

    $('.panel-controls .remove_obj').click(function() {
        let layer_group = $(this).parents('.panel-controls').data('layer-group');
        //console.log(layer_group);
        if(layer_group) main_canvas.removeImage(layer_group);
    });

    $('#object-opacity-controller').slider({
        value: 100,
        min: 0,
        max: 100,
        range: "min",
        animate: true,
        slide: function( event, ui ) {
            let layer_group = $(this).parents('.panel-controls').data('layer-group');
            if(layer_group) main_canvas.change_group_opacity(layer_group, ui.value/100 );
            $(this).siblings('.procents').html(ui.value + '%');
        },
        change: function( event, ui ) {
            $(this).siblings('.procents').html(ui.value + '%');
        }
    });

    $('.panel-controls').on('click', '[data-reflect]', function() {
        let reflect = $(this).data('reflect'),
            layer_group = $(this).parents('.panel-controls').data('layer-group');
        /**/
        main_canvas.layer_groups.every(function(item) {
            if(item.name == layer_group) {
                item.reflect(reflect);
                return false;
            }
            return true;
        });
    });
    $('.canvas-sizes-view').on('change', function() {
        let scale = main_canvas.canvas.width() / 10 / $(this).val();
        main_canvas.scale_layer_groups(scale);
    });

    $('form[name="append-text"]').submit(function() {

        return false;
    });

    $('.svg-color-select').on('click', '.do', function () {
        let content = $(this).parents('.svg-color-select').find('svg')[0].outerHTML.toString(),
            panel_control = $(this).parents('.panel-controls');
        console.log(content);
        $.post(ajax_requests_path, {
            request: 'save_svg',
            content: content,
            fdd: 'esrfgve'
        }, function (data) {
            console.log(data);
            let layer_group = panel_control.data('layer-group');
            console.log(layer_group);
            main_canvas.changeGroupSrc(layer_group, data);
        });
    });

    $( ".sortable" ).sortable({
        beforeStop: function(event, ui) {
            let count_layers = main_canvas.canvas.getLayers().length;
            /*main_canvas.canvas.getLayerGroup(ui.item.data('layergroup-name')).forEach(function(item) {
                main_canvas.canvas.moveLayer(item.x, count_layers);
            });
            ui.item.prevAll('li[data-layergroup-name]').each(function() {
                main_canvas.canvas.getLayerGroup($(this).data('layergroup-name')).forEach(function(item) {
                    main_canvas.canvas.moveLayer(item.x, count_layers);
                });
            });*/
            let prev_el = ui.item.prev('li[data-layergroup-name]'),
                last_indx = count_layers;
            if(prev_el.length) {
                main_canvas.canvas.getLayerGroup(prev_el.data('layergroup-name')).forEach(function(item, indx, arr) {
                    if(item.index < last_indx) last_indx = item.index;
                });
            }

            let changed_layers = main_canvas.canvas.getLayerGroup(ui.item.data('layergroup-name'));

            last_indx--;
            if(last_indx <= 0) last_indx = 0;
            //first_indx++;
            //console.log(first_indx);
            main_canvas.canvas.getLayerGroup(ui.item.data('layergroup-name')).forEach(function(item, indx, arr) {
                //console.log(item.x);
                //console.log(last_indx - arr.length + indx);
                main_canvas.canvas.moveLayer(item.index, last_indx).drawLayers();
            });
            main_canvas.canvas.drawLayers();
        }
    }).disableSelection();

    $(document).on('click', '.layers-order-list .remove', function() {
        let group_li = $(this).parents('[data-layergroup-name]');
        main_canvas.removeImage(group_li.data('layergroup-name'));
        return false;
    });
    $(document).on('click', '.layers-order-list .copy', function() {
        let group_li = $(this).parents('[data-layergroup-name]');
        main_canvas.addImage(main_canvas.canvas.getLayerGroup(group_li.data('layergroup-name'))[0].source);
        return false;
    });
});





class layers_group {//класс отвечающий за группы изображений
    constructor(canvas, src, type, layers_order_list) {//передаеться jQuery обьект canvas и путь к картинке
        //начинаем формировать имя новой группе слоев
        let group_name = 'layer ';
        let i = 0;
        while (canvas.getLayerGroup(group_name + i)) {
            i++;
        }
        group_name = group_name+i;
        ///
        this.layers_order_list = layers_order_list;
        //определяем свойства обьекта
        this.name = group_name;//имя новой группы
        this.layers_order_list.prepend('<li data-layergroup-name="'+group_name+'"><img src="'+src+'"><span class="name">'+group_name+'</span><span class="actions"><a href="#" class="copy" title="copy"><img src="/img/image-controls/6/copy.png"></a><a href="#" class="remove" title="remove"><img src="/img/image-controls/6/del.png"></a></span></li>');
        layers_order_list.sortable( "refresh" );
        this.canvas = canvas;//jQuery обьект канваса, в котором находится группа
        this.loc_period = 5;//частота расположения обьектов
        this.default_width = 100;//ширина рисунка по-умолчанию
        this.width = this.default_width;//первичная ширина рисунка
        this.start_draw = {//координаты начала отрисовки матрици изображений
            x: 0,
            y: 0
        };
        this.start_drag = {//координаты начала движения, нужно для отслеживания последующих манипуляций
            x: 0,
            y: 0
        };
        this.circle_controller_r_indx = 2;//множитель размера круга управления относительно изображения
        //
        this.default_font_size = 16;//размер текста по-умолчанию для текста!!!

        let obj = this;

        switch (type) {
            case 'image': {
                //действия добавления на полотно обьектов
                let img = new Image();///создаем картинку для определения вісоті и ширині обьекта
                img.onload = function() {
                    let img_w = this.width,
                        img_h = this.height;
                    obj.image_params = {
                        layer: true,
                        groups: [group_name],
                        dragGroups: [group_name],
                        source: src,
                        x: Math.round(obj.start_draw.x*canvas.data('scale')),
                        width: Math.round(canvas.data('scale')*obj.width),
                        height: Math.round(canvas.data('scale')*obj.width/img_w*img_h),
                        draggable: true,
                        dragstart: function(layer) {
                            obj.start_drag.x = layer.x;
                            obj.start_drag.y = layer.y;
                            obj.control_panel('hide');//прячем контрол панель
                        },
                        dragstop: function(layer) {
                            let left_top_layer = obj.get_last_layer(0);
                            obj.start_draw.x = left_top_layer.x;
                            obj.start_draw.y = left_top_layer.y;

                            //показываем контроль панель
                            obj.control_panel('show', layer, group_name);

                        },
                        drag: function(layer) {
                            obj.drag_group(layer);
                        },
                        mousedown: function(layer) {
                            clicked_t = new Date().getTime();

                        },
                        click: function(layer) {
                            clicked_t = new Date().getTime();

                            obj.control_panel('show', layer, group_name);
                        }
                    };//добавляем в свойство обьекта свойства слоя

                    for(let i = 0; i < 13; i++) {
                        obj.image_params.y = obj.start_draw.y*canvas.data('scale');
                        for(let j = 0; j < 6; j++) {
                            canvas.drawImage(obj.image_params);
                            obj.image_params.y += obj.image_params.width*obj.loc_period;
                        }
                        obj.image_params.x += obj.image_params.width*obj.loc_period;

                    }
                };
                img.src = src;
                obj.src = src;
            } break;
        }



    }

    is_layers_with_coords(x, y, deviation) {//проверяет, есть ли на заданых координатах слой в этой же группе с неким отклонением
        if(!deviation) deviation = 0;
        let result = false;
        this.canvas.getLayerGroup(this.name).every(function(item) {
            if((item.x + deviation >= x && item.x - deviation <= x) && (item.y + deviation >= y && item.y - deviation <= y)) {
                result = true;
                return false;
            }
            return true;
        });
        return result;
    }

    drag_group() {//для обеспечения бесконечности группы слоев, передаеться ведущий слой
        //определяем, в какую сторону движется группа,
        //console.log('do drag: ' + this.do_drag_group);
        if (this.do_drag_group) return false;
        this.do_drag_group = true;
        let obj = this,
            scale = obj.canvas.data('scale'),
            top_left = obj.get_last_layer(0),
            bottom_right = obj.get_last_layer(2);
        if(!top_left || !bottom_right) return false;///если какой-то сбой с этими 2мя обьектами - заканчиваем ф-цию, что-бы не вызвать ошибку
        //высчитываем 1/2 диагональ обьекта для буд. использования
        let diagonal = Math.ceil(Math.sqrt(Math.pow(top_left.width, 2) + Math.pow(top_left.height, 2)));
        ///
        if(top_left.x + diagonal < 0) {
            let new_x = Math.round(bottom_right.x + (obj.default_width * obj.loc_period * scale));
                //проверяем все это дело и назначаем новые координаты
                let do_changes = true,
                    changes_arr = {};
                obj.get_last_indxs(3).every(function (item2) {
                    let this_layer = obj.canvas.getLayer(item2);
                    if(!this_layer || obj.is_layers_with_coords(new_x, this_layer.y, obj.default_width*obj.loc_period*scale - 1)) {
                        do_changes = false;
                        return false;
                    }

                    changes_arr[item2] = {
                        x: new_x
                    };
                    return true;
                });
                //делаем изминения, если все в порядке
                if(do_changes) {
                    for(let key in changes_arr) {
                        obj.canvas.setLayer(+key, changes_arr[key]);
                    }
                    console.log('a');
                }
        }
        else if(bottom_right.x - diagonal > obj.canvas.width() + 1 && top_left.x - (obj.default_width * obj.loc_period * scale) + diagonal > 0) {
            let new_x = Math.round(obj.get_last_layer(0).x - (obj.default_width * obj.loc_period * scale));
            //проверяем есть ли необходимость переносить на противоположную сторону слои, если да - делаем
            if(new_x > 0 - (obj.default_width * obj.loc_period * scale)) {
                //проверяем все это дело и назначаем новые координаты
                let do_changes = true,
                    changes_arr = {};
                obj.get_last_indxs(1).every(function (item2) {
                    let this_layer = obj.canvas.getLayer(item2);
                    if(!this_layer || obj.is_layers_with_coords(new_x, this_layer.y,  obj.default_width*obj.loc_period*scale - 1)) {
                        do_changes = false;
                        return false;
                    }

                    changes_arr[item2] = {
                        x: new_x
                    };
                    return true;
                });
                //делаем изминения, если все в порядке
                if(do_changes) {
                    for(let key in changes_arr) {
                        obj.canvas.setLayer(+key, changes_arr[key]);
                    }
                    console.log('b');
                }
            }
        }
        ///
        if(top_left.y + diagonal < 0) {
            let new_y = bottom_right.y + (obj.default_width * obj.loc_period * scale);
                //проверяем все это дело и назначаем новые координаты
                let do_changes = true,
                    changes_arr = {};
                obj.get_last_indxs(0).every(function (item2) {
                    let this_layer = obj.canvas.getLayer(item2);
                    if(!this_layer || obj.is_layers_with_coords(this_layer.x, new_y,  obj.default_width*obj.loc_period*scale - 1)) {
                        do_changes = false;
                        return false;
                    }

                    changes_arr[item2] = {
                        y: new_y
                    };
                    return true;
                });
                //делаем изминения, если все в порядке
                if(do_changes) {
                    for(let key in changes_arr) {
                        obj.canvas.setLayer(+key, changes_arr[key]);
                    }
                    console.log('c');
                }
        }
        else if(bottom_right.y - diagonal > obj.canvas.height() + 1 && top_left.y - (obj.default_width * obj.loc_period * scale) + diagonal > 0) {
            let new_y = top_left.y - (obj.default_width * obj.loc_period * scale);
            //проверяем есть ли необходимость переносить на противоположную сторону слои, если да - делаем
            if(new_y < obj.canvas.height() + (obj.default_width * obj.loc_period * scale)) {
                //проверяем все это дело и назначаем новые координаты
                let do_changes = true,
                    changes_arr = {};
                obj.get_last_indxs(2).every(function (item2) {
                    let this_layer = obj.canvas.getLayer(item2);
                    if(!this_layer || obj.is_layers_with_coords(this_layer.x, new_y,  obj.default_width*obj.loc_period*scale - 1)) {
                        do_changes = false;
                        return false;
                    }

                    changes_arr[item2] = {
                        y: new_y
                    };
                    return true;
                });
                //делаем изминения, если все в порядке
                if(do_changes) {
                    for(let key in changes_arr) {
                        obj.canvas.setLayer(+key, changes_arr[key]);
                    }
                    console.log('d');
                }
            }
        }
        //////

        obj.do_drag_group = false;

    }

    get_last_indxs(code, exclude_indxs) {//выдает масив индексов слоев по стороне
        /*
         значения code:
         0 - верхний
         1 - правый
         2 - нижний
         3 - левый
         */
        let layer = this.get_last_layer(code, exclude_indxs),
            result_arr = [];
        //if(!exclude_indxs) exclude_indxs = [];
        this.canvas.getLayerGroup(this.name).every(function(item) {
            if(layer.x == item.x && code%2) {
                result_arr.push(item.index);
            }
            else if (layer.y == item.y && code%2 == 0) {
                result_arr.push(item.index);
            }
            return true;
        });
        return result_arr;
    }

    get_last_layer(code, exclude_indxs) {//определяем крайние обьекты по коду и возвращаем данные такого слоя
        /*
        значения кодо:
        0 - крайний верхний левый
        1 - крайний верхний правый
        2 - крайний нижний правый
        3 - крайний нижний левый
         */
        let result_layer = false;
        if(!exclude_indxs) exclude_indxs = [];
        this.canvas.getLayerGroup(this.name).every(function(item) {//перебираим их
            if(exclude_indxs.indexOf(item.index) != -1) return true;
                if (!result_layer) result_layer = item;
                switch (code) {
                    case 0: {
                        if (item.x <= result_layer.x && item.y <= result_layer.y) result_layer = item;
                    }
                        break;
                    case 1: {
                        if (item.x >= result_layer.x && item.y <= result_layer.y) result_layer = item;
                    }
                        break;
                    case 2: {
                        if (item.x >= result_layer.x && item.y >= result_layer.y) result_layer = item;
                    }
                        break;
                    case 3: {
                        if (item.x <= result_layer.x && item.y >= result_layer.y) result_layer = item;
                    }
                        break;
                }
                return true;
        });
        return result_layer;
    }

    control_panel(action, layer, group_name) {
        //показываем контроль панель
        let panel = $('.panel-controls'),
            obj = this;
        switch (action) {
            case 'show': {
                panel.find('li.active').removeClass('active');
                panel.show();
                panel.css({
                    top: 'auto',
                    left: layer.x - panel.width()/2,
                    bottom: panel.parent().height() - layer.y + (layer.width / 2 * obj.circle_controller_r_indx + 10)
                });
                panel.data('layer-group', group_name);
                panel.find('#object-opacity-controller').slider('option', 'value', layer.opacity*100);
                obj.control_panel('reload-info', layer);




                    obj.canvas.removeLayerGroup('control');

                    obj.canvas.drawArc({
                        strokeStyle: '#222222',
                        strokeWidth: 1,
                        layer: true,
                        name: 'circle-controller',
                        data_image_index: layer.index,
                        x: Math.round(layer.x),
                        y: Math.round(layer.y),
                        radius: Math.round(layer.width/2*obj.circle_controller_r_indx*layer.scale),
                        draggable: false,
                        dragGroups: [obj.name],
                        groups: ['control'],
                        click: function (layer_l) {
                            clicked_t = new Date().getTime();
                        },
                        mouseup: function (layer_l) {
                            clicked_t = new Date().getTime();
                        },
                        drag: function (layer_l) {
                            obj.drag_group();
                        },
                        dragstop: function(layer_l) {
                            clicked_t = new Date().getTime();
                            obj.control_panel('show-panel', layer);
                        },
                        dragstart: function(layer_l) {
                            //obj.control_panel('hide');//прячем контрол панель
                            obj.control_panel('hide-panel');
                        }
                    });

                    //определяем текущее положение от поворота
                    let start_point = {
                            x: Math.round(layer.x + layer.width/2*obj.circle_controller_r_indx*layer.scale),
                            y: Math.round(layer.y)
                        },
                        rx = start_point.x - layer.x,
                        ry = start_point.y - layer.y,
                        c = Math.cos(layer.rotate / (180/Math.PI)),
                        s = Math.sin(layer.rotate / (180/Math.PI)),
                        x1 = layer.x + rx * c - ry * s,
                        y1 = layer.y + rx * s + ry * c;
                    //
                    obj.canvas.drawArc({//рисуем круг с заливкой
                        fillStyle: '#222222',
                        layer: true,
                        x: Math.round(x1),
                        y: Math.round(y1),
                        radius: 8,
                        draggable: true,
                        groups: [obj.name, 'control'],
                        click: function (layer_l) {
                            clicked_t = new Date().getTime();
                        },
                        mouseup: function (layer_l) {
                            clicked_t = new Date().getTime();
                        },
                        drag: function(layer_l) {
                            let circle_controller = obj.canvas.getLayer('circle-controller'),
                                diff_x = Math.abs(circle_controller.x - layer_l.x),
                                diff_y = Math.abs(circle_controller.y - layer_l.y),
                                diff_xy = Math.sqrt(Math.pow(diff_x, 2) + Math.pow(diff_y, 2)),
                                new_r = diff_x > diff_y ? diff_x : diff_y;
                            if(diff_xy > new_r) new_r = diff_xy;
                            let new_w = layer.width * (new_r / circle_controller.radius),
                                new_h = layer.height * (new_r / circle_controller.radius);
                            //высчитываем поворот на определенный градус
                            let start_p = {//берем самуюправую точку (это будет начало поворота
                                    x: Math.round(layer.x + new_r),
                                    y: Math.round(layer.y)
                                },
                                l_l = Math.abs(Math.pow(layer_l.y - start_p.y, 2) + Math.pow(layer_l.x - start_p.x, 2)),
                                deg = (Math.pow(new_r, 2)*2 - l_l)/(2*(new_r)*(new_r));

                            if(deg >= 0 && start_p.y <= layer_l.y) deg = 90*(1-deg);
                            else if (deg <= 0 && start_p.y <= layer_l.y) deg = 90 + 90*Math.abs(deg);
                            else if (deg <= 0 && start_p.y >= layer_l.y) deg = 180 + 90*(1 - Math.abs(deg));
                            else deg = 270 + 90*Math.abs(deg);

                            obj.canvas.setLayerGroup(group_name, {
                                width: Math.round(new_w),
                                height: Math.round(new_h),
                                rotate: Math.round(deg)
                            });
                            obj.canvas.setLayer('circle-controller', {
                                radius: new_r
                            });
                            obj.width = new_w / obj.canvas.data('scale');
                        },
                        dragstop: function(layer_l) {
                            clicked_t = new Date().getTime();
                            obj.control_panel('show-panel', layer);
                        },
                        dragstart: function(layer_l) {
                            //obj.control_panel('hide');//прячем контрол панель
                            obj.control_panel('hide-panel', layer);
                        }
                    });

                /*load svg content*/
                $.post(ajax_requests_path, {
                    request: 'get_svg_content',
                    path: obj.src
                }, function (data) {
                    panel.find('.svg-color-select').find('svg').replaceWith(data);
                });

            } break;
            case 'show-panel': {
                panel.show();
                panel.css({
                    top: 'auto',
                    left: layer.x - panel.width()/2,
                    bottom: panel.parent().height() - layer.y + (layer.width / 2 * obj.circle_controller_r_indx + 10)
                });
                panel.data('layer-group', group_name);
                panel.find('#object-opacity-controller').slider('option', 'value', layer.opacity*100);
                obj.control_panel('reload-info', layer);
                //panel.find('li.active').removeClass('active');
            } break;
            case 'hide': {
                panel.hide();
                panel.find('li.active').removeClass('active');
                obj.canvas.removeLayerGroup('control');
            } break;
            case 'hide-panel': {
                panel.hide();
                panel.find('li.active').removeClass('active');
            } break;
            case 'reload-info': {//обновляем отображаемую информацию в панеле
                panel.find('.x-position-value').html(Math.round(layer.x / this.canvas.data('scale')) + ' мм');
                panel.find('.y-position-value').html(Math.round(layer.y / this.canvas.data('scale')) + ' мм');
                panel.find('.deg-position-value').html(Math.round(layer.rotate) + ' &deg;');
                panel.find('.width-value').html(Math.round(layer.width / this.canvas.data('scale')) + ' мм');
                panel.find('.height-value').html(Math.round(layer.height / this.canvas.data('scale')) + ' мм');
            }
        }
    }

    change_opacity(opacity) {
        this.canvas.setLayerGroup(this.name, {
            opacity: opacity
        });
        this.canvas.setLayerGroup('control', {
            opacity: 1
        }).drawLayers();
    }
    change_src(src) {
        this.src = src;
        this.canvas.setLayerGroup(this.name, {
            source: src
        }).drawLayers();
        this.layers_order_list.find('[data-layergroup-name="'+this.name+'"]').children('img').attr('src', src);
    }

    reflect(direction) {
        let layers = this.canvas.getLayerGroup(this.name);
        if(!layers) return false;
        let layer = layers[0];
        if(layer.scaleX === undefined && layer.scaleY === undefined) {
            this.canvas.setLayerGroup(this.name, {
                scaleX: 1,
                scaleY: 1
            });
            layer.scaleX = 1;
            layer.scaleY = 1;
        }
        else if(layer.scaleX === undefined) {
            this.canvas.setLayerGroup(this.name, {
                scaleX: 1
            });
            layer.scaleX = 1;
        }
        else if(layer.scaleY === undefined) {
            this.canvas.setLayerGroup(this.name, {
                scaleY: 1
            });
            layer.scaleY = 1;
        }
        switch (direction) {
            case 'horizontal': {//
                this.canvas.setLayerGroup(this.name, {
                    scaleX: - layer.scaleX
                }).drawLayers();
            } break;
            case 'vertical': {
                this.canvas.setLayerGroup(this.name, {
                    scaleY: - layer.scaleY
                }).drawLayers();
            } break;
        }
    }

    scale(mouse_coords) {//ресайзит элементы при смене масштаба
        let obj = this,
            layers = obj.canvas.getLayerGroup(this.name),
            scale = +obj.canvas.data('scale'),
            last_scale = layers[0].width/obj.width;
            layers.forEach(function (item) {
                obj.canvas.setLayer(item.index, {
                    x: Math.round(item.x/last_scale * scale),
                    y: Math.round(item.y/last_scale * scale),
                    width: Math.round(item.width/last_scale * scale),
                    height: Math.round(item.height/last_scale * scale),
                });
            });
            obj.canvas.drawLayers();
    }

    destroy() {
        this.canvas.removeLayerGroup(this.name);
        this.control_panel('hide');
        this.canvas.drawLayers();
    }
}

class Canvas {
    constructor(canvas) {
        this.canvas = canvas;//jQuery обьект канваса
        this.click_start = {
            status: false,
            start_x: false,
            start_y: false
        };//для отслеживания зажатой левой кнопки мыши либо вождениея пальца по канвасу
        this.layer_groups = [];//список наименований существующих обьектов
        //триггеры
        this.canvasResize();
        let obj = this;
        $(window).resize(function() {
            obj.canvasResize();
        });
        /*панель контроля*/
        this.panel_control = canvas.siblings('.panel-controls');
        if(!this.panel_control.length) {
            //здесь нужен код на случай отсуствия панели
        }
        this.panel_control.hide();//прячем контрол панель
        this.panel_control.on('click', 'a[href*="#"]', function () {
            $(this).parent('li').toggleClass('active');
            $(this).parent('li').siblings('.active').removeClass('active');
        });
        this.panel_control.on('click', 'svg *', function (e) {//выделяем фильтром кликнутый элемент
            e.stopPropagation();
            $(this).parents('svg').find('.active-el').not(this).removeClass('active-el');
            $(this).toggleClass('active-el');
            let act_color = $(this).css('fill');
            if(act_color) $('.change-el-color-picker').ColorPickerSetColor(obj.rgbStrToHex(act_color));
        });
        $('.change-el-color-picker').ColorPicker({//обьявляем колор пиккер
            flat: true,
            onChange: function(hsb, hex, rgb) {//меняем фон выбраного элемента
                $('.svg-color-select svg .active-el').css({
                    fill: hex
                });
            }
        });
        ///////
        this.layers_order_list = $('.layers-order-list');//jQuery обьект с списком груп слоев
        /////////
        this.mousewheel();
        /**/
        canvas.click(function() {
            let t_diff = Math.abs(clicked_t - new Date().getTime());
            if(t_diff > 1) {
                canvas.removeLayerGroup('control');
                obj.panel_control.hide();
                obj.panel_control.find('li.active').removeClass('active');
            }
        });
    }

    mousewheel() {//scale при прокрутке мышкой над canvas
        let obj = this;
        function onWheel(e) {
            if(obj.layer_groups.length) {
                obj.layer_groups[0].control_panel('hide');
            }
            $(this).removeLayerGroup('control');
            e = e || window.event;
            let indx = 0.0006,
                coords = {
                    x: Math.round(e.pageX - $(this).offset().left),
                    y: Math.round(e.pageY - $(this).offset().top),
                };
            // wheelDelta не дает возможность узнать количество пикселей
            let delta = e.deltaY || e.detail || e.wheelDelta;

            //let scale = +$(this).data('scale-layers');
            let scale = +$(this).data('scale');
            if(!scale) scale = 1;
            scale  -= indx * delta;
            //!!!!
            obj.scale_layer_groups(scale);
        }
        let elem = this.canvas[0];
        if (elem.addEventListener) {
            if ('onwheel' in document) {
                // IE9+, FF17+, Ch31+
                elem.addEventListener("wheel", onWheel);
            } else if ('onmousewheel' in document) {
                // устаревший вариант события
                elem.addEventListener("mousewheel", onWheel);
            } else {
                // Firefox < 17
                elem.addEventListener("MozMousePixelScroll", onWheel);
            }
        } else { // IE8-
            elem.attachEvent("onmousewheel", onWheel);
        }
    }

    scale_layer_groups(scale) {
        scale = parseFloat(scale).toFixed(2);
        if(scale < 0.5) scale = 0.5;
        else if(scale > 3) scale = 3;
        console.log(this.canvas.data('scale'));
        if(this.canvas.data('scale') != scale) {
            this.canvas.data('scale', scale);
            $('.canvas-sizes-view').val(Math.round(this.canvas.width() / 10 / scale));
            this.layer_groups.forEach(function (item) {
                item.scale(/*coords*/);
            });
        }
    }

    canvasResize () {//ресайз канваса при смене разрешения экрана экрана
        this.canvas.each(function() {
            let width = $(this).width(),
                height = $(this).height();
            $(this).attr('width', width);
            $(this).attr('height', height);
            $(this).drawLayers();
        });
    }

    addImage(src) {
        this.layer_groups.push(new layers_group(this.canvas, src, 'image', this.layers_order_list));
    }

    addText(text, settings) {

    }

    removeImage(group_name) {
        let obj = this;
        if(obj.layer_groups && obj.layer_groups.length) {
            obj.layer_groups.forEach(function(item, indx) {
                if(item.name == group_name) {
                    item.destroy();
                    obj.layer_groups.splice(indx, 1);
                    obj.panel_control.hide();
                }
            });
        }
        this.layers_order_list.find('[data-layergroup-name="'+group_name+'"]').remove();
    }

    change_group_opacity(group_name, opacity) {
        let obj = this;
        if(obj.layer_groups && obj.layer_groups.length) {
            obj.layer_groups.forEach(function(item) {
                if(item.name == group_name) {
                    item.change_opacity(opacity);
                }
            });
        }
    }

    show_image_layer_controls(layer) {

    }

    clear() {
        if(this.layer_groups.length) {
            this.layer_groups[0].control_panel('hide');
        }
        this.canvas.removeLayers().drawLayers();
        this.canvas.css('background-color', '#ffffff');
        this.layer_groups = [];
    }

    rgbStrToHex(str) {
        function componentToHex(c) {
            /*c = c.toString();
            if(c.length < 3) {
                for(let i = 0; i < (3 - c.length); i++) {
                    c = '0'+c;
                }
            }*/
            c = +c;
            let hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }
        let rgb_arr = str.replace(/[^0-9,]/gi, '').split(',');
        console.log(rgb_arr);
        return "#" + componentToHex(rgb_arr[0]) + componentToHex(rgb_arr[1]) + componentToHex(rgb_arr[2]);
    }

    changeGroupSrc(group_name, src) {
        let obj = this;
        if(obj.layer_groups && obj.layer_groups.length) {
            obj.layer_groups.forEach(function(item) {
                if(item.name == group_name) {
                    item.change_src(src);
                }
            });
        }
    }


}







