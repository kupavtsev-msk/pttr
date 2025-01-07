let ajax_requests_path = '/requests.php';

$(document).ready(function() {


    $('.left-nav-bar a, #submenu-1 a').click(function() {
        if($(this).attr('href').length > 1 && $(this).attr('href')[0] == '#' && $($(this).attr('href')).length) {
            if($(this).hasClass('active')) {
                $(this).removeClass('active');
                $($(this).attr('href')).removeClass('open');
                $($(this).attr('href')).find('a.active').each(function() {
                    if($(this).attr('href').length > 1 && $(this).attr('href')[0] == '#' && $($(this).attr('href')).length) $(this).trigger('click');
                });
            }
            else {
                if($(this).parents('.left-nav-bar').length) $('.left-nav-bar a.active').trigger('click');
                else if($(this).parents('#submenu-1').length) $('#submenu-1 a.active').trigger('click');
                $(this).addClass('active');
                $($(this).attr('href')).addClass('open');
            }
        }
    });

    $('header').click(function(e) {
        e.stopPropagation();
    });

    $(document).click(function(){
        $('.left-nav-bar a.active').trigger('click');
    });

    $('.icon-class-list .head').click(function () {
        var container = $(this).parents('.icon-class-list');
        if(container.hasClass('open')) container.removeClass('open');
        else container.addClass('open');
    });

    $('#submenu-1-2 .font').click(function() {
        var container = $(this).parents('#submenu-1-2');
        if($(this).hasClass('active')) {
            $(this).removeClass('active');
            container.find('textarea').css('font-family', 'inherit');
        }
        else {
            container.find('textarea').css('font-family', $(this).css('font-family'));
            container.find('.font.active').removeClass('active');
            $(this).addClass('active');
        }
        return false;
    });

    $('#area-background').ColorPicker({
        flat: true,
        onChange: function(hsb, hex, rgb) {
            $(this).parents('#area-background').attr('data-color', '#'+hex);
            console.log(hex);
            $('#main-canvas').css('background-color', '#'+hex);
        }
    });



    $('#submenu-3').on('click', 'a.color', function() {
        $('#area-background').ColorPickerSetColor($(this).data('color'));
        $('#main-canvas').css('background-color', $(this).data('color'));
    });

    $('.svg-color-select').on('click', 'a.color', function() {
        $('.svg-color-select .change-el-color-picker').ColorPickerSetColor($(this).data('color'));
        $('.svg-color-select svg .active-el').css({
            fill: $(this).data('color')
        });
    });

    /*вставляем палитры, где нужно*/
    $.post(ajax_requests_path, {
        request: 'get_paliters'
    }, function(data) {
        if(data) {
            try {
                data = JSON.parse(data);
                for(let key in data) {
                    let html_append = '<li class="palitra"><div class="name">'+key+'</div><div class="colors">';
                    if(data[key]) data[key].forEach(function(item) {
                        html_append += '<a href="#" class="color" data-color="'+item+'" style="background-color: '+item+';"></a>';
                    });
                    html_append += '</div></li>';
                    $('.paliters-append').append(html_append);
                }
            } catch (e) {
                console.log('Ошибка!!! ' + e);
            }
        }
    });
});
