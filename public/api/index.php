<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$host = 'localhost';
$dbname = 'u410995534_vrukshacompos';
$user = 'u410995534_harishneela71';
$pass = 'CodTech@1208';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB connection failed']);
    exit();
}

$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
if (strpos($path, '/api') === 0) $path = substr($path, 4);
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

function parseProduct(&$p) {
    if (isset($p['images'])) $p['images'] = json_decode($p['images'], true) ?: [];
    if (isset($p['variants'])) $p['variants'] = json_decode($p['variants'], true) ?: [];
    if (isset($p['availableOffers'])) $p['availableOffers'] = json_decode($p['availableOffers'], true) ?: [];
    if (isset($p['specifications'])) $p['specifications'] = json_decode($p['specifications'], true) ?: (object)[];
    $p['price'] = floatval($p['price'] ?? 0);
    $p['originalPrice'] = floatval($p['originalPrice'] ?? 0);
    $p['discountPercentage'] = floatval($p['discountPercentage'] ?? 0);
    $p['rating'] = floatval($p['rating'] ?? 4.5);
    $p['reviewCount'] = intval($p['reviewCount'] ?? 0);
    $p['stockQuantity'] = intval($p['stockQuantity'] ?? 0);
    $p['inStock'] = (bool)($p['inStock'] ?? true);
    $p['isSponsored'] = (bool)($p['isSponsored'] ?? false);
    $p['isDeleted'] = (bool)($p['isDeleted'] ?? false);
    $p['product_id'] = $p['id'];
    // Add missing array fields that the frontend Edit form expects
    foreach (['highlights', 'benefits', 'tags', 'faqs', 'features', 'colors', 'sizes', 'images', 'availableOffers', 'variants'] as $f) {
        if (!isset($p[$f]) || !is_array($p[$f])) $p[$f] = [];
    }
    if (!isset($p['specifications']) || !is_object($p['specifications'])) $p['specifications'] = (object)[];
}

// GET /products
if (preg_match('#^/products/?$#', $path) && $method === 'GET') {
    $sql = "SELECT * FROM Product WHERE isDeleted = 0";
    $params = [];
    if (!empty($_GET['category'])) { $sql .= " AND category = ?"; $params[] = $_GET['category']; }
    if (!empty($_GET['search'])) { $sql .= " AND (name LIKE ? OR description LIKE ?)"; $params[] = "%{$_GET['search']}%"; $params[] = "%{$_GET['search']}%"; }
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($products as &$p) parseProduct($p);
    echo json_encode($products);
    exit();
}

// POST /products
if (preg_match('#^/products/?$#', $path) && $method === 'POST') {
    $id = $input['product_id'] ?? ('VC-NEW-' . time());
    $stmt = $pdo->prepare("INSERT INTO Product (id,name,category,subCategory,description,images,price,originalPrice,discountPercentage,rating,reviewCount,inStock,stockQuantity,variants,specifications,warranty,seller,isSponsored,isDeleted,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())");
    $stmt->execute([$id, $input['name'] ?? $input['product_name'] ?? 'Unnamed', $input['category'] ?? '', $input['subCategory'] ?? '', $input['description'] ?? '', json_encode($input['images'] ?? []), $input['price'] ?? 0, $input['originalPrice'] ?? 0, $input['discountPercentage'] ?? 0, $input['rating'] ?? 4.5, $input['reviewCount'] ?? 0, $input['inStock'] ?? 1, $input['stockQuantity'] ?? 100, json_encode($input['variants'] ?? []), json_encode($input['specifications'] ?? (object)[]), $input['warranty'] ?? 'Standard', $input['seller'] ?? 'Vruksha Composites', $input['isSponsored'] ?? 0, 0]);
    $input['id'] = $id; $input['product_id'] = $id;
    http_response_code(201);
    echo json_encode($input);
    exit();
}

// POST /products/:id/restore
if (preg_match('#^/products/([^/]+)/restore$#', $path, $m) && $method === 'POST') {
    $pdo->prepare("UPDATE Product SET isDeleted=0, updatedAt=NOW() WHERE id=?")->execute([$m[1]]);
    echo json_encode(['message' => 'Product restored']);
    exit();
}

// GET/PATCH/DELETE /products/:id
if (preg_match('#^/products/([^/]+)$#', $path, $m)) {
    $id = $m[1];
    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM Product WHERE id=? AND isDeleted=0"); $stmt->execute([$id]);
        $p = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($p) { parseProduct($p); echo json_encode($p); } else { http_response_code(404); echo json_encode(['message'=>'Not found']); }
        exit();
    }
    if ($method === 'PATCH' || $method === 'PUT') {
        $f=[]; $v=[];
        foreach (['name','category','subCategory','description','price','originalPrice','discountPercentage','stockQuantity','inStock','warranty','seller','isSponsored'] as $k) { if (isset($input[$k])) { $f[]="$k=?"; $v[]=$input[$k]; } }
        if (isset($input['images'])) { $f[]="images=?"; $v[]=json_encode($input['images']); }
        if (isset($input['variants'])) { $f[]="variants=?"; $v[]=json_encode($input['variants']); }
        if (isset($input['specifications'])) { $f[]="specifications=?"; $v[]=json_encode($input['specifications']); }
        $f[]="updatedAt=NOW()"; $v[]=$id;
        $pdo->prepare("UPDATE Product SET ".implode(',',$f)." WHERE id=?")->execute($v);
        $stmt=$pdo->prepare("SELECT * FROM Product WHERE id=?"); $stmt->execute([$id]);
        $p=$stmt->fetch(PDO::FETCH_ASSOC); parseProduct($p); echo json_encode($p);
        exit();
    }
    if ($method === 'DELETE') {
        $pdo->prepare("UPDATE Product SET isDeleted=1, updatedAt=NOW() WHERE id=?")->execute([$id]);
        echo json_encode(['message'=>'Product deleted']);
        exit();
    }
}

// CATEGORIES
if (preg_match('#^/categories/?$#', $path)) {
    echo json_encode($pdo->query("SELECT * FROM Category")->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

// SETTINGS
$sf = __DIR__ . '/../server/src/data/site_settings.json';
// DIAGNOSTIC ROUTE: GET /db-info
if (preg_match('#^/db-info/?$#', $path) && $method === 'GET') {
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $info = [];
    foreach ($tables as $table) {
        $info[$table] = $pdo->query("DESCRIBE $table")->fetchAll(PDO::FETCH_ASSOC);
    }
    echo json_encode($info);
    exit();
}

if (preg_match('#^/settings/?$#', $path)) {
    if ($method === 'GET') {
        $data = file_exists($sf) ? json_decode(file_get_contents($sf), true) : [];
        if (!$data || !isset($data['categories']) || count($data['categories']) <= 3) {
            $data = [
                'banners' => [],
                'categories' => [
                    ['id' => 'natural fibers', 'name' => 'Natural Fibers', 'icon' => '🌿'],
                    ['id' => 'synthetic fibers', 'name' => 'Synthetic Fibers', 'icon' => '🧵'],
                    ['id' => 'nano products', 'name' => 'Nano Products', 'icon' => '🔬'],
                    ['id' => 'chemical powders', 'name' => 'Chemical Powders', 'icon' => '🧪'],
                    ['id' => 'resins', 'name' => 'Resins', 'icon' => '🧴'],
                    ['id' => 'composite making', 'name' => 'Composite Making', 'icon' => '🛠️'],
                    ['id' => 'additive nanoworks', 'name' => 'Additive NanoWorks', 'icon' => '⚗️']
                ]
            ];
        }

        // DYNAMICALY ADD CATEGORIES FROM PRODUCTS TABLE
        $dbCats = $pdo->query("SELECT DISTINCT category FROM Product WHERE category != '' AND category IS NOT NULL")->fetchAll(PDO::FETCH_COLUMN);
        $existingIds = array_map(function($c) { return $c['id']; }, $data['categories']);
        
        foreach ($dbCats as $cat) {
            $catId = strtolower(trim($cat));
            if (!in_array($catId, $existingIds)) {
                $data['categories'][] = [
                    'id' => $catId,
                    'name' => ucwords($cat),
                    'icon' => '📦' // Default icon for dynamic categories
                ];
                $existingIds[] = $catId;
            }
        }

        echo json_encode($data);
        exit();
    }
    if ($method === 'PATCH' || $method === 'PUT') {
        $cur = file_exists($sf) ? json_decode(file_get_contents($sf), true) : [];
        $upd = array_merge($cur, $input ?? []);
        file_put_contents($sf, json_encode($upd, JSON_PRETTY_PRINT));
        echo json_encode($upd); exit();
    }
}

// AUTH (mock)
if (preg_match('#^/auth/me$#', $path)) { echo json_encode(['_id'=>'admin-1','name'=>'Dev Admin','email'=>'admin@vruksha.com','role'=>'admin']); exit(); }
if (preg_match('#^/auth/login$#', $path)) { echo json_encode(['_id'=>'admin-1','name'=>'Dev Admin','email'=>'admin@vruksha.com','role'=>'admin','token'=>'mock']); exit(); }
if (preg_match('#^/auth/logout$#', $path)) { echo json_encode(['message'=>'Logged out']); exit(); }

// ORDERS (stub)
if (preg_match('#^/orders#', $path)) { echo json_encode([]); exit(); }

http_response_code(404);
echo json_encode(['error'=>'Not found','path'=>$path]);
