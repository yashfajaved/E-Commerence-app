<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

error_reporting(0);
ini_set('display_errors', 0);

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "leohub_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit();
}

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    echo json_encode(["error" => "Invalid ID"]);
    exit();
}

$sql = "SELECT id, name, category, price, image_url, description, rating, material, weight, in_stock 
        FROM jewelry_products WHERE id = $id";

$result = $conn->query($sql);
$product = null;

if ($result->num_rows > 0) {
    $product = $result->fetch_assoc();
}

echo json_encode($product);
$conn->close();
?>