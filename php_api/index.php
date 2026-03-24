<?php
// PHP API Router for Hostinger
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database config
$host = 'localhost';
$dbname = 'u410995534_vrukshacompos';
$user = 'u410995534_harishneela71';
$pass = 'CodTech@1208';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// Parse the request URI
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/api';

// Remove query string
$path = parse_url($requestUri, PHP_URL_PATH);

// Remove /api prefix
if (strpos($path, $basePath) === 0) {
    $path = substr($path, strlen($basePath));
}

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// ==================== PRODUCTS ====================
if (preg_match('#^/products/?$#', $path)) {
    if ($method === 'GET') {
        // Get all products
        $category = $_GET['category'] ?? null;
        $search = $_GET['search'] ?? null;

        $sql = "SELECT * FROM Product WHERE isDeleted = 0";
        $params = [];

        if ($category) {
            $sql .= " AND category = ?";
            $params[] = $category;
        }
        if ($search) {
            $sql .= " AND (name LIKE ? OR description LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Parse JSON fields
        foreach ($products as &$p) {
            $p['images'] = json_decode($p['images'], true) ?: [];
            $p['variants'] = json_decode($p['variants'], true) ?: [];
            $p['specifications'] = json_decode($p['specifications'], true) ?: (object)[];
            $p['price'] = floatval($p['price']);
            $p['originalPrice'] = floatval($p['originalPrice']);
            $p['discountPercentage'] = floatval($p['discountPercentage']);
            $p['rating'] = floatval($p['rating']);
            $p['reviewCount'] = intval($p['reviewCount']);
            $p['stockQuantity'] = intval($p['stockQuantity']);
            $p['inStock'] = (bool)$p['inStock'];
            $p['isSponsored'] = (bool)$p['isSponsored'];
            $p['isDeleted'] = (bool)$p['isDeleted'];
            // Map product_id for frontend compatibility
            $p['product_id'] = $p['id'];
        }

        echo json_encode($products);
        exit();
    }

    if ($method === 'POST') {
        // Create product
        $id = $input['product_id'] ?? ('VC-NEW-' . time());
        $stmt = $pdo->prepare("INSERT INTO Product (id, name, category, subCategory, description, images, price, originalPrice, discountPercentage, rating, reviewCount, inStock, stockQuantity, variants, specifications, warranty, seller, isSponsored, isDeleted, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())");
        $stmt->execute([
            $id,
            $input['name'] ?? $input['product_name'] ?? 'Unnamed Product',
            $input['category'] ?? '',
            $input['subCategory'] ?? $input['subcategory'] ?? '',
            $input['description'] ?? '',
            json_encode($input['images'] ?? []),
            $input['price'] ?? 0,
            $input['originalPrice'] ?? 0,
            $input['discountPercentage'] ?? 0,
            $input['rating'] ?? 4.5,
            $input['reviewCount'] ?? 0,
            $input['inStock'] ?? 1,
            $input['stockQuantity'] ?? 100,
            json_encode($input['variants'] ?? []),
            json_encode($input['specifications'] ?? (object)[]),
            $input['warranty'] ?? 'Standard Warranty',
            $input['seller'] ?? 'Vruksha Composites',
            $input['isSponsored'] ?? 0,
            0
        ]);
        $input['id'] = $id;
        $input['product_id'] = $id;
        http_response_code(201);
        echo json_encode($input);
        exit();
    }
}

// Single product by ID
if (preg_match('#^/products/([^/]+)/restore$#', $path, $matches)) {
    if ($method === 'POST') {
        $id = $matches[1];
        $stmt = $pdo->prepare("UPDATE Product SET isDeleted = 0, updatedAt = NOW() WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['message' => 'Product restored successfully']);
        exit();
    }
}

if (preg_match('#^/products/([^/]+)$#', $path, $matches)) {
    $id = $matches[1];

    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT * FROM Product WHERE id = ? AND isDeleted = 0");
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($product) {
            $product['images'] = json_decode($product['images'], true) ?: [];
            $product['variants'] = json_decode($product['variants'], true) ?: [];
            $product['specifications'] = json_decode($product['specifications'], true) ?: (object)[];
            $product['product_id'] = $product['id'];
            echo json_encode($product);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Product not found']);
        }
        exit();
    }

    if ($method === 'PATCH' || $method === 'PUT') {
        $fields = [];
        $values = [];
        $allowed = ['name', 'category', 'subCategory', 'description', 'price', 'originalPrice', 'discountPercentage', 'stockQuantity', 'inStock', 'warranty', 'seller', 'isSponsored'];
        foreach ($allowed as $f) {
            if (isset($input[$f])) {
                $fields[] = "$f = ?";
                $values[] = $input[$f];
            }
        }
        // Handle JSON fields
        if (isset($input['images'])) { $fields[] = "images = ?"; $values[] = json_encode($input['images']); }
        if (isset($input['variants'])) { $fields[] = "variants = ?"; $values[] = json_encode($input['variants']); }
        if (isset($input['specifications'])) { $fields[] = "specifications = ?"; $values[] = json_encode($input['specifications']); }

        $fields[] = "updatedAt = NOW()";
        $values[] = $id;
        $sql = "UPDATE Product SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);

        $stmt = $pdo->prepare("SELECT * FROM Product WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);
        $product['images'] = json_decode($product['images'], true) ?: [];
        $product['variants'] = json_decode($product['variants'], true) ?: [];
        $product['specifications'] = json_decode($product['specifications'], true) ?: (object)[];
        echo json_encode($product);
        exit();
    }

    if ($method === 'DELETE') {
        $stmt = $pdo->prepare("UPDATE Product SET isDeleted = 1, updatedAt = NOW() WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['message' => 'Product deleted']);
        exit();
    }
}

// ==================== CATEGORIES ====================
if (preg_match('#^/categories/?$#', $path)) {
    $stmt = $pdo->query("SELECT * FROM Category");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($categories);
    exit();
}

// ==================== SETTINGS ====================
$settingsFile = __DIR__ . '/../server/src/data/site_settings.json';
if (preg_match('#^/settings/?$#', $path)) {
    if ($method === 'GET') {
        if (file_exists($settingsFile)) {
            echo file_get_contents($settingsFile);
        } else {
            echo json_encode((object)[]);
        }
        exit();
    }
    if ($method === 'PATCH' || $method === 'PUT') {
        $current = file_exists($settingsFile) ? json_decode(file_get_contents($settingsFile), true) : [];
        $updated = array_merge($current, $input ?? []);
        file_put_contents($settingsFile, json_encode($updated, JSON_PRETTY_PRINT));
        echo json_encode($updated);
        exit();
    }
}

// ==================== AUTH (Mock) ====================
if (preg_match('#^/auth/me$#', $path)) {
    echo json_encode(['_id' => 'admin-1', 'name' => 'Dev Admin', 'email' => 'admin@vruksha.com', 'role' => 'admin']);
    exit();
}
if (preg_match('#^/auth/login$#', $path)) {
    echo json_encode(['_id' => 'admin-1', 'name' => 'Dev Admin', 'email' => 'admin@vruksha.com', 'role' => 'admin', 'token' => 'mock-token']);
    exit();
}
if (preg_match('#^/auth/logout$#', $path)) {
    echo json_encode(['message' => 'Logged out']);
    exit();
}

// ==================== ORDERS (stub) ====================
if (preg_match('#^/orders#', $path)) {
    echo json_encode([]);
    exit();
}

// ==================== DASHBOARD STATS ====================
if (preg_match('#^/dashboard/?$#', $path)) {
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM Product WHERE isDeleted = 0");
    $totalProducts = $stmt->fetch()['total'];
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM Category");
    $totalCategories = $stmt->fetch()['total'];
    echo json_encode([
        'totalProducts' => intval($totalProducts),
        'totalCategories' => intval($totalCategories),
        'activeItems' => intval($totalProducts),
        'archivedItems' => 0
    ]);
    exit();
}

// Default: 404
http_response_code(404);
echo json_encode(['error' => 'Endpoint not found', 'path' => $path]);
