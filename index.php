<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="//ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <link rel="stylesheet" href="fonts/font-awesome-4.7.0/css/font-awesome.min.css">
    <!--color picker-->
    <link rel="stylesheet" href="colorpicker/css/colorpicker.css">
    <script src="colorpicker/js/colorpicker.js"></script>
    <!--color picker-->
    <!--jcanvas-->
    <script src="js/jcanvas.js"></script>
    <!--canvas2svg-->
    <script src="/js/c2s.js"></script>
    <!--jquery ui-->
    <link rel="stylesheet" href="jquery-ui-1.12.1/jquery-ui.css">
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script src="//cdn.jsdelivr.net/gh/mar10/jquery-ui-contextmenu@v1/jquery.ui-contextmenu.min.js"></script>
    <!--jquery ui-->
    <script src="js/js.js"></script>
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/canvas.css">
    <script src="js/canvas.js"></script>
    <!--bonsai-->
    <script src="http://cdnjs.cloudflare.com/ajax/libs/bonsai/0.4/bonsai.min.js"></script>
    <!--bonsai-->
</head>
<body>
<!--SVG filter-->
<svg style="height: 0; width: 0; position: absolute; z-index: -999999999;">
    <filter id="dropshadow" height="130%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="15"/> <!-- stdDeviation is how much to blur -->
        <feOffset dx="0" dy="0" result="offsetblur"/> <!-- how much to offset -->
        <feComponentTransfer>
            <feFuncA type="linear" slope="1"/> <!-- slope is the opacity of the shadow -->
        </feComponentTransfer>
        <feMerge>
            <feMergeNode/> <!-- this contains the offset blurred image -->
            <feMergeNode in="SourceGraphic"/> <!-- this contains the element that the filter is applied to -->
        </feMerge>
    </filter>
</svg>
<header>
    <ul class="top-nav-bar">
        <li><a href="#"><img alt="logo" src="/img/logo.svg"></a></li>
        <li>Сумма 1500 руб.</li>
        <li class="clicked">Количество: <span class="polotno-count">1</span> м
            <div class="sub">
                <label class="top">
                    <input type="number" name="polotno_count" value="1">
                    П.М.
                </label>
                <div class="slider" id="slider1"></div>
                <div class="bottom-inscription">MAX 5000  п.м.</div>
            </div>
        </li>
        <li><a href="#">Выбрать материал <i class="fa fa-caret-down" aria-hidden="true"></i></a></li>
        <li>Размер <input type="text" class="canvas-sizes-view" placeholder="" name="canvas-sizes-view" value="19"> см

        </li>
        <li><a href="#" class="green-button">ЗАКАЗАТЬ</a></li>
        <li><a href="#" class="grey-button">Поделиться</a>
            <div class="sub share-block">
                <div class="preview left"></div>
                <div class="socials right">
                    <div class="head">Поделиться</div>

                </div>
            </div>
        </li>
        <li><a href="#" class="grey-button"><i class="fa fa-user" aria-hidden="true"></i> Войти</a></li>
        <li></li>
    </ul>
    <ul class="left-nav-bar">
        <li><a href="#" id="clearCanvas" title="Новая"><img alt="Новая" src="/img/left-menu-icons/007-edit.png"><span>Новая</span></a></li>
        <li><a href="#submenu-1" title="Элементы"><img alt="Элементы" src="/img/left-menu-icons/001-layers.png"><span>Элементы</span></a></li>
        <li><a href="#submenu-2" title="Примерить"><img alt="Примерить" src="/img/left-menu-icons/006-user.png"><span>Примерить</span></a></li>
        <li><a href="#submenu-3" title="Фон"><img alt="Фон" src="/img/left-menu-icons/010-paint-brush.png"><span>Фон</span></a></li>
        <li><a href="#submenu-4" title="Настройки"><img alt="Настройки" src="/img/left-menu-icons/005-multimedia.png"><span>Настройки</span></a></li>
        <li><a href="#" title="Помощь"><img alt="Помощь" src="/img/left-menu-icons/009-information.png"><span>Помощь</span></a></li>
        <li><a href="#" title="Случайно"><img alt="Случайно" src="/img/left-menu-icons/shuffle.png"><span>Случайно</span></a></li>
    </ul>
    <ul class="submenu" id="submenu-1">
        <li class="head">Выберите элементы</li>
        <li><a href="#submenu-1-1" title="Библиотека"><img alt="Библиотека" src="img/left-menu-icons/submenu-1/icon-1.png"><span>Библиотека</span></a></li>
        <li><a href="#submenu-1-2" title="Текст"><img alt="Текст" src="img/left-menu-icons/submenu-1/icon-2.png"><span>Текст</span></a></li>
        <li><a href="#submenu-1-3" title="Свой элемент"><img alt="Свой элемент" src="img/left-menu-icons/submenu-1/icon-3.png"><span>Свой элемент</span></a></li>
    </ul>
    <ul class="submenu" id="submenu-1-1">
        <li class="head">Библиотека</li>
        <li class="search">
            <form name="library-search">
                <input type="text" name="name" placeholder="поиск">
            </form>
        </li>
        <?
        $f_dir = "elements";
        $counter = 0;
        foreach(scandir($f_dir) as $dir) :
            $dir = iconv ("cp1251", "UTF-8", $dir);
            $counter ++;
            if($counter >= 3 && is_dir(iconv ("UTF-8", "cp1251", $f_dir.'/'.$dir))) :
                ?>
            <li class="icon-class-list">
                <a href="#" class="head"><?= $dir;?></a>
                <div class="icons">
                    <? foreach(scandir(iconv ("UTF-8", "cp1251",$f_dir.'/'.$dir)) as $img) :
                        $img = iconv ("cp1251", "UTF-8", $img);
                        if(is_file(iconv ("UTF-8", "cp1251", $f_dir.'/'.$dir.'/'.$img))) :
                            $img_url = str_replace([' '], ['%20'], '/'.$f_dir.'/'.$dir.'/'.$img);
                            ?>
                    <a href="<?= $img_url; ?>" class="icon-point" style="background-image: url(<?= $img_url; ?>);"></a>
                <? endif; endforeach; ?>
                </div>
            </li>
        <? endif; endforeach; ?>
    </ul>
    <ul class="submenu" id="submenu-1-2">
        <li class="head">Добавить свой текст</li>
        <li class="search">
            <form name="append-text" onsubmit="return false;" >
                <textarea name="text" required placeholder="Ваш текст"></textarea>
                <button class="green-button" type="submit">ДОБАВИТЬ</button>
            </form>
            <div id="preview-svg"></div>
        </li>
        <li class="head">Шрифт</li>
        <li>
            <style>
                @font-face {
                    font-family: "AP Applique Cut";
                    src: url("/fonts/AP-Aplique/AP-Applique-Cut.ttf");
                }
            </style>
            <a href="/fonts/AP-Aplique/AP-Applique-Cut.ttf" class="font" style="font-family: 'AP Applique Cut', sans-serif;">AP Applique Cut</a>
        </li>
        <li>
            <style>
                @font-face {
                    font-family: "AP Applique Stitched";
                    src: url("/fonts/AP-Aplique/AP-Applique-Stitched.ttf");
                }
            </style>
            <a href="/fonts/AP-Aplique/AP-Applique-Stitched.ttf" class="font" style="font-family: 'AP Applique Stitched', sans-serif;">AP Applique Stitched</a>
        </li>
        <li>
            <style>
                @font-face {
                    font-family: "Verbal Diarrhea";
                    src: url("/fonts/Verbal-Diarrhea/Verbal-Diarrhea.ttf");
                }
            </style>
            <a href="/fonts/Verbal-Diarrhea/Verbal-Diarrhea.ttf" class="font" style="font-family: 'Verbal Diarrhea', sans-serif;">Verbal Diarrhea</a>
        </li>
        <li>
            <style>
                @font-face {
                    font-family: "111";
                    src: url("/fonts/11186.ttf");
                }
            </style>
            <a href="/fonts/11186.ttf" class="font" style="font-family: '111', sans-serif;">Verbal Diarrhea</a>
        </li>
    </ul>
    <ul class="submenu" id="submenu-1-3">
        <li class="head">Добавить свой элемент</li>
        <li><input type="file" name="my_file" class="green-button" accept="image/*"></li>
        <li class="head">Элементы</li>
        <li class="loading"><img alt="loading" src="/img/ajax-loader.gif"></li>
        <li>
            <div class="icons"></div>
        </li>
    </ul>
    <!---->
    <ul class="submenu" id="submenu-2">
        <li class="head"><a href="#" id="triggerElement" class="grey-button">Примерить на себе
            <span>(распечатать)</span></a>
        </li>
        <li class="point">
            <a href="#" title="Примерять">
                <div class="head">Платье</div>
                <img alt="примерять" src="/img/left-menu-icons/submenu-2/1.png">
            </a>
        </li>
        <li class="point">
            <a href="#" title="Примерять">
                <div class="head">Обувь</div>
                <img alt="примерять" src="/img/left-menu-icons/submenu-2/2.png">
            </a>
        </li>
        <li class="point">
            <a href="#" title="Примерять">
                <div class="head">Футболка</div>
                <img alt="примерять" src="/img/left-menu-icons/submenu-2/3.png">
            </a>
        </li>
        <li class="point">
            <a href="#" title="Примерять">
                <div class="head">Рюкзак</div>
                <img alt="примерять" src="/img/left-menu-icons/submenu-2/4.png">
            </a>
        </li>
    </ul>
    <!---->
    <ul class="submenu" id="submenu-3">
        <li class="head">Выберите основной цвет фона</li>
        <li><div id="area-background"></div></li>
        <li class="head paliters-header">Палитры</li>
        <li class="paliters">
            <ul class="paliters-append">
            </ul>
        </li>
    </ul>
    <!---->
    <ul class="submenu" id="submenu-4">
        <li class="head">Настройки</li>
        <li class="sett-group">
            <div class="head">Размеры ячейки</div>
            <label class="line">
                <span class="insc">По горизонтали</span>
                <span class="input"><input type="number" name="gorisontal" min="0" value="15"><span class="unit">см</span></span>
            </label>
            <label class="line">
                <span class="insc">По вертикали</span>
                <span class="input block"><input type="number" name="vertical" min="0" value="20"><span class="unit">см</span></span>
            </label>
            <label class="line">
                <span class="insc">Сохранить пропорции</span>
                <span class="input"><input type="checkbox" name="proporcyi"><span class="toggle"></span></span>
            </label>
        </li>
        <li class="sett-group">
            <div class="head">Другие</div>
            <label class="line">
                <span class="insc">Показать сетку</span>
                <span class="input"><input type="checkbox" name="pokazat_setku"><span class="toggle"></span></span>
            </label>
            <label class="line">
                <span class="insc">Показать линейку</span>
                <span class="input"><input type="checkbox" name="pokazat_lineyku"><span class="toggle"></span></span>
            </label>
        </li>
    </ul>
</header>
<div id="canvas-wrap">
        <ul class="panel-controls">
            <li><a href="#" title="Цвет"><div class="butt-icon" style="background-image: url(img/image-controls/1.png);"></div>Цвет</a>
                <div class="sub svg-color-select">
                    <div class="top">
                        <div class="left">
                            <div class="left svg-preview"></div>
                            <div class="buttWrapper">
                                <a href="#" class="green-button do">ПРИМЕНИТЬ</a>
                            </div>
                        </div>
                        <div class="right change-el-color-picker"></div>
                    </div>
                    <ul class="paliters-append"></ul>
                </div>
            </li>
            <li><a href="#" title="Положение"><div class="butt-icon" style="background-image: url(img/image-controls/2.png);"></div>Положение</a>
                <table class="sub position-info">
                    <tr><td><img alt="" src="/img/image-controls/2/1.png"></td><td>Позиция по оси X</td><td class="x-position-value"><input type="number" name="x-position-value" value="0"> мм</td></tr>
                    <tr><td><img alt="" src="/img/image-controls/2/2.png"></td><td>Позиция по оси Y</td><td class="y-position-value"><input type="number" name="y-position-value" value="0"> мм</td></tr>
                    <tr><td><img alt="" src="/img/image-controls/2/3.png"></td><td>Поворот</td><td class="deg-position-value"><input type="number" name="deg-position-value" value="0"> &deg;</td></tr>
                </table>
            </li>
            <li><a href="#" title="Размер"><div class="butt-icon" style="background-image: url(img/image-controls/3.png);"></div>Размер</a>
                <table class="sub sizes-info">
                    <tr><td>Ширина</td><td class="width-value"><input type="number" name="width-value" value="0" min="1"> мм</td></tr>
                    <tr><td>Высота</td><td class="height-value"><input type="number" name="height-value"  value="0" min="1"> мм</td></tr>
                </table>
            </li>
            <li><a href="#" title="Отразить"><div class="butt-icon" style="background-image: url(img/image-controls/4.png);"></div>Отразить</a>
                <div class="sub reflect-buttons">
                    <a href="#" data-reflect="horizontal"><img alt="" src="/img/image-controls/4/1.png">По горизонтали</a>
                    <a href="#" data-reflect="vertical"><img alt="" src="/img/image-controls/4/2.png">По вертикали</a>
                </div>
            </li>
            <li><a href="#" title="Прозрачность"><div class="butt-icon" style="background-image: url(img/image-controls/5.png);"></div>Прозрачность</a>
                <div class="sub opacity-controller-wrap">
                    <div class="procents">100%</div>
                    <div id="object-opacity-controller"></div>
                </div>
            </li>
            <li><a href="#" title="Порядок"><div class="butt-icon" style="background-image: url(img/image-controls/6.png);"></div>Порядок</a>
                <div class="sub layers-order">
                    <div class="head">
                        Слои
                    </div>
                    <ul class="layers-order-list sortable"></ul>
                </div>
            </li>
            <li><a href="#" class="remove_obj" title="Удалить"><div class="butt-icon" style="background-image: url(img/image-controls/7.png);"></div>Удалить</a></li>
        </ul>
    <canvas id="main-canvas" width="500" height="500" data-scale="1"></canvas>
</div>
<div id="myModal" class="full-screen-modal">
  <!-- Содержимое модального окна -->
  <div class="modal-content">
    <span class="close-button" onclick="closeModal()">&times;</span>
    <img src="https://design.spacefabrics.com/img/leggins2.png" style="width:100%; height:auto;" alt="Мокап">
  </div>
</div>
<style>
  body, html {
    height: 100%;
    margin: 0;
    overflow: hidden; /* Предотвращаем прокрутку страницы */
  }

  .full-screen-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0); /* Фоновый цвет и прозрачность модального окна */
    z-index: 1000; /* Убедитесь, что модальное окно будет поверх других элементов */
    overflow: hidden; /* Убираем прокрутку внутри модального окна */
  }

  .modal-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover; /* Устанавливаем размер фона так, чтобы он покрывал весь контент */
    background-position: center; /* Центрируем изображение фона */
    background-repeat: no-repeat; /* Предотвращаем повторение фона */
  }

  .close-button {
    position: fixed;
    top: 20px;
    right: 40px;
    font-size: 40px;
    color: white;
    z-index: 1001; /* Чтобы кнопка была поверх модального окна */
    cursor: pointer;
  }
</style>
</body>
<script>
// Получаем модальное окно
var modal = document.getElementById("myModal");

// Получаем элемент, который открывает модальное окно
var triggerElement = document.getElementById("triggerElement");

// Когда пользователь кликает на элемент, открыть модальное окно
triggerElement.onclick = function() {
  modal.style.display = "block";
}

// Функция закрытия модального окна
function closeModal() {
  modal.style.display = "none";
}

// Если пользователь кликает вне изображения, закрыть модальное окно
window.onclick = function(event) {
  if (event.target === modal) {
    closeModal();
  }
}
</script>
</html>