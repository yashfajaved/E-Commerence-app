<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "leohub_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Connection failed: " . $conn->connect_error]);
    exit();
}

// Get filter parameters
$category = isset($_GET['category']) ? $_GET['category'] : '';
$search = isset($_GET['search']) ? $_GET['search'] : '';

$sql = "SELECT id, name, category, price, image_url, description, rating, in_stock FROM skincare_products WHERE 1=1";

if ($category && $category != 'All') {
    $sql .= " AND category = '$category'";
}

if ($search) {
    $sql .= " AND (name LIKE '%$search%' OR description LIKE '%$search%')";
}

$sql .= " ORDER BY id";

$result = $conn->query($sql);
$products = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $products[] = $row;
    }
}

echo json_encode(["success" => true, "data" => $products, "count" => count($products)]);
$conn->close();
?>