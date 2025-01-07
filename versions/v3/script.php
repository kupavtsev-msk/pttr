<?
    $options = explode(', ', $params['radius']);
    if(is_array($options)) :
        $min = $options[0];
        $max = $options[0];
        foreach ($options as $v) {
            if($v < $min) $min = $v;
            if($v > $max) $max = $v;
        }
        ?>
        <div id="radius_slider"></div>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.css">
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js"></script>
        <script>
            jQuery(document).ready(function($) {
                let slider = $('#radius_slider');
                slider.slider({
                    range: "min",
                    min: <? echo $min; ?>,
                    max: <? echo $max; ?>,
                    value: <? echo $min; ?>,
                    step: 25,
                    slide: function( event, ui ) {
                        slider.find('.ui-slider-handle').attr('data-hint', ui.value + 'km');
                    },
                    create: function( event, ui ) {
                        slider.find('.ui-slider-handle').attr('data-hint', '<? echo $min; ?>km');
                    }
                });
            });
        </script>
<?
        endif;
    ?>