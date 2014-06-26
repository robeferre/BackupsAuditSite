<?php
$filename = $_GET["filename"];
$fh = fopen($filename,"r");
Header("Content-type:application/octet-stream");  
Header("Accept-Ranges: bytes");  
Header("Accept-Length: " . filesize($filename));  
Header("Content-Disposition: attachment; filename=" . $filename);  
echo fread($fh, filesize($filename));  
fclose($fh);  
exit();
?>