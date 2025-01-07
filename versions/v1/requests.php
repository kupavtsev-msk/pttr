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
        }
    }

}