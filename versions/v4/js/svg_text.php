<?php
header('Content-Type: application/javascript');
?>
    console.log('<? echo $_GET['font_src']; ?>');
    console.log('<? echo $_GET['text']; ?>');
    new FontFamily('myFontFamily', [
        '<? echo $_GET['font_src']; ?>',
    ]);
    new Text('<? echo $_GET['text']; ?>').attr({
        x: 16,
        fontSize: 16,
        fontFamily:'myFontFamily'
    }).addTo(stage);
