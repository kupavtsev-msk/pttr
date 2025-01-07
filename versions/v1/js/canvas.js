let clicked_t = new Date().getTime();
$(document).ready(function($) {
    let main_canvas = new Canvas($('#main-canvas'));//обьявляем обьект

    $('#submenu-1-1').on('click', 'a.icon-point', function(e) {
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

});


class image_group {//класс отвечающий за группы изображений
    constructor(canvas, src) {//передаеться jQuery обьект canvas и путь к картинке
        //начинаем формировать имя новой группе слоев
        let group_name = 'layer group ';
        let i = 0;
        while (canvas.getLayerGroup(group_name + i)) {
            i++;
        }
        group_name = group_name+i;
        ///
        //определяем свойства обьекта
        this.name = group_name;//имя новой группы
        this.canvas = canvas;//jQuery обьект канваса, в котором находится группа
        this.loc_period = 6;//частота расположения обьектов
        this.default_width = 80;//ширина рисунка по-умолчанию
        this.width = this.default_width;//первичная ширина рисунка
        this.start_draw = {//координаты начала отрисовки матрици изображений
            x: -500,
            y: -500
        };
        this.start_drag = {//координаты начала движения, нужно для отслеживания последующих манипуляций
            x: 0,
            y: 0
        };
        this.circle_controller_r_indx = 2;//множитель размера круга управления относительно изображения
        //


        //действия добавления на полотно обьектов
        let obj = this,//передаем указатель на обьект для дальнейшего использования
            img = new Image();///создаем картинку для определения вісоті и ширині обьекта

        img.onload = function() {
            let img_w = this.width,
                img_h = this.height,
                image_params = {
                    layer: true,
                    groups: [group_name],
                    dragGroups: [group_name],
                    source: src,
                    x: obj.start_draw.x*canvas.data('scale'),
                    width: canvas.data('scale')*obj.width,
                    height: canvas.data('scale')*obj.width/img_w*img_h,
                    draggable: true,
                    dragstart: function(layer) {
                        obj.start_drag.x = layer.x;
                        obj.start_drag.y = layer.y;
                        obj.control_panel('hide');//прячем контрол панель
                    },
                    dragstop: function(layer) {
                        obj.start_draw.x = obj.start_draw.x + (layer.x - obj.start_drag.x) / canvas.data('scale');
                        obj.start_draw.y = obj.start_draw.y + (layer.y - obj.start_drag.y) / canvas.data('scale');

                        //показываем контроль панель
                        obj.control_panel('show', layer, group_name);
                    },
                    mousedown: function(layer_l) {
                        clicked_t = new Date().getTime();
                    },
                    click: function(layer) {
                        clicked_t = new Date().getTime();
                        if(!canvas.getLayer('circle-controller') || layer.index != canvas.getLayer('circle-controller').data_image_index) {
                            /*panel-control*/
                            obj.control_panel('show', layer, group_name);


                            /**/

                            canvas.removeLayerGroup('control');

                            canvas.drawArc({
                                strokeStyle: '#222222',
                                strokeWidth: 1,
                                layer: true,
                                name: 'circle-controller',
                                data_image_index: layer.index,
                                x: layer.x,
                                y: layer.y,
                                radius: (layer.width/2*obj.circle_controller_r_indx*layer.scale),
                                draggable: false,
                                dragGroups: [group_name],
                                groups: [group_name, 'control'],
                                click: function (layer_l) {
                                    clicked_t = new Date().getTime();
                                },
                                mouseup: function (layer_l) {
                                    clicked_t = new Date().getTime();
                                },
                                dragstop: function(layer_l) {
                                    clicked_t = new Date().getTime();
                                    obj.control_panel('show', layer, group_name);
                                },
                                dragstart: function(layer_l) {
                                    obj.control_panel('hide');//прячем контрол панель
                                }
                            });

                            /*определяем текущее положение от поворота*/
                            let start_point = {
                                x: (layer.x + layer.width/2*obj.circle_controller_r_indx*layer.scale),
                                y: layer.y
                            },
                                rx = start_point.x - layer.x,
                                ry = start_point.y - layer.y,
                                c = Math.cos(layer.rotate / (180/Math.PI)),
                                s = Math.sin(layer.rotate / (180/Math.PI)),
                                x1 = layer.x + rx * c - ry * s,
                                y1 = layer.y + rx * s + ry * c;
                            /**/
                            canvas.drawArc({//рисуем круг с заливкой
                                fillStyle: '#222222',
                                layer: true,
                                x: x1,
                                y: y1,
                                radius: 8,
                                draggable: true,
                                groups: [group_name, 'control'],
                                click: function (layer_l) {
                                    clicked_t = new Date().getTime();
                                    console.log('circle clicked');
                                },
                                mouseup: function (layer_l) {
                                    clicked_t = new Date().getTime();
                                },
                                drag: function(layer_l) {
                                    let circle_controller = canvas.getLayer('circle-controller'),
                                        diff_x = Math.abs(circle_controller.x - layer_l.x),
                                        diff_y = Math.abs(circle_controller.y - layer_l.y),
                                        diff_xy = Math.sqrt(Math.pow(diff_x, 2) + Math.pow(diff_y, 2)),
                                        new_r = diff_x > diff_y ? diff_x : diff_y;
                                    if(diff_xy > new_r) new_r = diff_xy;
                                    let new_w = layer.width * (new_r / circle_controller.radius),
                                        new_h = layer.height * (new_r / circle_controller.radius);
                                    //высчитываем поворот на определенный градус
                                    let start_p = {//берем самуюправую точку (это будет начало поворота
                                        x: layer.x + new_r,
                                        y: layer.y
                                    },
                                        l_l = Math.abs(Math.pow(layer_l.y - start_p.y, 2) + Math.pow(layer_l.x - start_p.x, 2)),
                                        deg = (Math.pow(new_r, 2)*2 - l_l)/(2*(new_r)*(new_r));
                                    console.log(deg);

                                    if(deg >= 0 && start_p.y <= layer_l.y) deg = 90*(1-deg);
                                    else if (deg <= 0 && start_p.y <= layer_l.y) deg = 90 + 90*Math.abs(deg);
                                    else if (deg <= 0 && start_p.y >= layer_l.y) deg = 180 + 90*(1 - Math.abs(deg));
                                    else deg = 270 + 90*Math.abs(deg);

                                    canvas.setLayerGroup(group_name, {
                                        width: new_w,
                                        height: new_h,
                                        rotate: deg
                                    });
                                    canvas.setLayer('circle-controller', {
                                        radius: /*(new_w/2*layer.scale)*/new_r
                                    });
                                    obj.width = new_w / canvas.data('scale');
                                },
                                dragstop: function(layer_l) {
                                    clicked_t = new Date().getTime();
                                    obj.control_panel('show', layer, group_name);
                                },
                                dragstart: function(layer_l) {
                                    obj.control_panel('hide');//прячем контрол панель
                                }
                            });



                        }

                    }
                };
            for(let i = 0; i < 6; i++) {
                image_params.y = obj.start_draw.y*canvas.data('scale');
                for(let j = 0; j < 6; j++) {
                    canvas.drawImage(image_params);
                    image_params.y += image_params.height*obj.loc_period;
                }
                image_params.x += image_params.width*obj.loc_period;

            }
        };
        img.src = src;
    }

    control_panel(action, layer, group_name) {
        //показываем контроль панель
        let panel = $('.panel-controls'),
            obj = this;
        switch (action) {
            case 'show': {
                panel.show();
                panel.css({
                    top: 'auto',
                    left: layer.x - panel.width()/2,
                    bottom: panel.parent().height() - layer.y + (layer.height / 2 * obj.circle_controller_r_indx + 10)
                });
                panel.data('layer-group', group_name);
                panel.find('#object-opacity-controller').slider('option', 'value', layer.opacity*100);
                obj.control_panel('reload-info', layer);
            } break;
            case 'hide': {
                panel.hide();
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

    scale(mouse_coords) {//ресайзит элементы при смене масштаба
        let obj = this,
            layers = obj.canvas.getLayerGroup(this.name);
        if(layers) {
            console.log(obj.start_draw );
            let matrix_size = Math.sqrt(layers.length),
                pos_x = obj.start_draw.x*obj.canvas.data('scale'),
                pos_y = obj.start_draw.y*obj.canvas.data('scale'),
                item = layers[0],
                image_w_on_h = item.height/item.width,//коэфициент пропорции картинки
                image_params = {
                    x: pos_x,
                    y: pos_y,
                    width: obj.canvas.data('scale')*obj.width,
                    height: obj.canvas.data('scale')*obj.width*image_w_on_h
                };

            layers.forEach(function (item, indx) {
                obj.canvas.setLayer(item.index, image_params);

                if(((indx + 1)%matrix_size) == 0) {
                    image_params.x += obj.default_width*obj.loc_period*obj.canvas.data('scale');
                    image_params.y = obj.start_draw.y*obj.canvas.data('scale');
                }
                else {
                    image_params.y += obj.default_width*image_w_on_h*obj.loc_period*obj.canvas.data('scale');
                }
            });
            obj.canvas.drawLayers();
        }
    }

    destroy() {
        this.canvas.removeLayerGroup(this.name);
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
        /////////
        this.mousewheel();
        /**/
        canvas.click(function() {
            let t_diff = Math.abs(clicked_t - new Date().getTime());
            if(t_diff > 1) {
                canvas.removeLayerGroup('control');
                obj.panel_control.hide();
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
                    x: e.pageX - $(this).offset().left,
                    y: e.pageY - $(this).offset().top,
                };
            // wheelDelta не дает возможность узнать количество пикселей
            let delta = e.deltaY || e.detail || e.wheelDelta;

            //let scale = +$(this).data('scale-layers');
            let scale = +$(this).data('scale');
            if(!scale) scale = 1;
            scale  -= indx * delta;
            if(scale < 0.5) scale = 0.5;
            else if(scale > 4) scale = 4;
            $(this).data('scale', scale);

            $('.canvas-sizes-view').html(Math.round($(this).width()/10/scale));
            obj.layer_groups.forEach(function(item) {
                item.scale(coords);
            });
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
        this.layer_groups.push(new image_group(this.canvas, src));
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


}







