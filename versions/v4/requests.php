<?php
if(isset($_REQUEST['request'])) {
    switch ($_REQUEST['request']) {
        case 'get_paliters': {//выдаем json с палитрами
            /*
             * вид массива
             * ['название палитры' => [массив hex кодов цветов]]
             */
            $result = [
                'Осень-зима 2018' => [
                    '#ff1dfd',
                    '#ff79df',
                    '#ffeff8',
                    '#48bdfe',
                    '#066e7c',
                    '#12aafd',
                    '#1369fd'
                ],
                'Малиновка' => [
                    '#ff055b',
                    '#ff1249',
                    '#fefe57',
                    '#fefe69',
                    '#1e0128',
                    '#57fee5',
                    '#150ffd'
                ]
            ];
            echo json_encode($result);
        } break;
        case 'get_text_svg_path': {
            $dir = __DIR__.'/cache/';
            $name = 'svg-text-';
            $i = 0;
            //делаем имя уникальным
            while(file_exists($dir.$name.$i.'.svg')) {
                $i++;
            }
            //
            $save_file_name_path = $dir.$name.$i.'.svg';
            //делаеем надпись свг
            $lines_arr = explode("\n", $_REQUEST['text']);
            $font_size = $_REQUEST['font_size'];
            //
            $svg_content = '<?xml version="1.0" encoding="utf-8"?>'.$_REQUEST['svg_content'];
            file_put_contents($save_file_name_path, $svg_content);
            echo str_replace(__DIR__, '', $save_file_name_path);
        } break;

        case 'remove_text_svg': {} break;
        case 'get_svg_content': {

            $path = $_REQUEST['path'];
            if(!preg_match('/^.*\.svg$/i', $path)) exit;
            if($path[0] != '/') $path = '/'.$path;
            $content = file_get_contents(__DIR__.$path, FILE_USE_INCLUDE_PATH);
            if($content) {
                $start = stripos($content, '<svg');
                if($start != -1) {
                    echo substr($content, $start);
                }
            }
        } break;

        case 'save_svg': {
            $dir = __DIR__.'/cache/';
            $name = 'svg-';
            $i = 0;
            //делаем имя уникальным
            while(file_exists($dir.$name.$i.'.svg')) {
                $i++;
            }
            //
            $save_file_name_path = $dir.$name.$i.'.svg';
            $svg_content = '<?xml version="1.0" encoding="utf-8"?>'.$_REQUEST['content'];
            if(file_put_contents($save_file_name_path, $svg_content)) echo str_replace(__DIR__, '', $save_file_name_path);

        } break;
    }

}
elseif (isset($_FILES['img'])) {
    $uploadfile = "cache/".$_FILES['img']['name'];
    $counter = 0;
    while(file_exists($uploadfile)) {
        $uploadfile = "cache/".$counter.$_FILES['img']['name'];
        $counter++;
    }
    move_uploaded_file($_FILES['img']['tmp_name'], $uploadfile);
    echo '/'.$uploadfile;
}