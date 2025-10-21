const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const sampleProducts = [
  // Electronics (12 products)
  {
    name: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
    price: 2999,
    originalPrice: 3999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 50,
    rating: 4.5,
    reviewCount: 120,
    fastDelivery: true,
    features: ["Noise Cancellation", "30hr Battery", "Fast Charge", "Bluetooth 5.0"],
    specifications: {
      "Battery": "30 hours",
      "Connectivity": "Bluetooth 5.0",
      "Weight": "250g",
      "Color": "Black"
    }
  },
  {
    name: "Smart Watch Series 5",
    description: "Advanced smartwatch with health monitoring features, GPS, and water resistance up to 50 meters.",
    price: 12999,
    originalPrice: 15999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 30,
    rating: 4.3,
    reviewCount: 89,
    fastDelivery: true,
    features: ["Heart Rate Monitor", "GPS", "Water Resistant", "Sleep Tracking"],
    specifications: {
      "Display": "1.5 inch AMOLED",
      "Battery": "7 days",
      "Water Resistance": "50m",
      "Compatibility": "iOS & Android"
    }
  },
  {
    name: "Smartphone X Pro",
    description: "Latest smartphone with advanced camera system, 5G connectivity, and all-day battery life.",
    price: 54999,
    originalPrice: 69999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 20,
    rating: 4.8,
    reviewCount: 300,
    fastDelivery: true,
    features: ["5G Connectivity", "Triple Camera", "All-day Battery", "Fast Charging"],
    specifications: {
      "Display": "6.7 inch OLED",
      "Storage": "128GB",
      "Camera": "48MP Triple",
      "Battery": "4500mAh"
    }
  },
  {
    name: "Gaming Laptop",
    description: "High-performance gaming laptop with RTX graphics and high refresh rate display.",
    price: 89999,
    originalPrice: 109999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 15,
    rating: 4.6,
    reviewCount: 150,
    fastDelivery: true,
    features: ["RTX 4060", "16GB RAM", "1TB SSD", "144Hz Display"],
    specifications: {
      "Processor": "Intel i7-13700H",
      "Graphics": "RTX 4060",
      "RAM": "16GB DDR5",
      "Storage": "1TB NVMe SSD"
    }
  },
  {
    name: "Wireless Earbuds",
    description: "True wireless earbuds with crystal clear sound and comfortable fit.",
    price: 1999,
    originalPrice: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1590658165737-15a047b8b5e0?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1590658165737-15a047b8b5e0?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 80,
    rating: 4.2,
    reviewCount: 95,
    fastDelivery: true,
    features: ["True Wireless", "24hr Battery", "IPX5 Waterproof", "Touch Controls"],
    specifications: {
      "Battery": "24 hours",
      "Connectivity": "Bluetooth 5.2",
      "Waterproof": "IPX5",
      "Weight": "4g per earbud"
    }
  },
  {
    name: "Tablet Pro",
    description: "Powerful tablet for work and entertainment with stunning display.",
    price: 34999,
    originalPrice: 44999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 25,
    rating: 4.4,
    reviewCount: 120,
    fastDelivery: true,
    features: ["11-inch Display", "128GB Storage", "Stylus Support", "All-day Battery"],
    specifications: {
      "Display": "11-inch Retina",
      "Storage": "128GB",
      "Battery": "10 hours",
      "Processor": "A15 Bionic"
    }
  },
  {
    name: "Digital Camera",
    description: "Professional digital camera with 4K video and advanced autofocus.",
    price: 45999,
    originalPrice: 59999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 12,
    rating: 4.7,
    reviewCount: 85,
    fastDelivery: true,
    features: ["24MP Sensor", "4K Video", "WiFi Connectivity", "Weather Sealed"],
    specifications: {
      "Sensor": "24MP APS-C",
      "Video": "4K 30fps",
      "Lens Mount": "EF-M",
      "ISO Range": "100-25600"
    }
  },
  {
    name: "Wireless Speaker",
    description: "Portable Bluetooth speaker with 360-degree sound and waterproof design.",
    price: 3999,
    originalPrice: 5999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 45,
    rating: 4.3,
    reviewCount: 200,
    fastDelivery: true,
    features: ["360° Sound", "IP67 Waterproof", "20hr Battery", "Party Mode"],
    specifications: {
      "Battery": "20 hours",
      "Waterproof": "IP67",
      "Connectivity": "Bluetooth 5.0",
      "Weight": "1.2kg"
    }
  },

  // Fashion (8 products)
  {
    name: "Men's Casual Shirt",
    description: "Comfortable cotton shirt perfect for casual outings and office wear.",
    price: 1299,
    originalPrice: 1999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 100,
    rating: 4.2,
    reviewCount: 150,
    fastDelivery: true,
    features: ["100% Cotton", "Regular Fit", "Machine Wash", "Wrinkle Resistant"],
    specifications: {
      "Material": "100% Cotton",
      "Fit": "Regular",
      "Care": "Machine Wash",
      "Color": "Blue"
    }
  },
  {
    name: "Women's Summer Dress",
    description: "Elegant floral print dress perfect for summer occasions.",
    price: 1999,
    originalPrice: 2999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 75,
    rating: 4.5,
    reviewCount: 120,
    fastDelivery: true,
    features: ["Floral Print", "Lightweight", "Breathable", "Machine Wash"],
    specifications: {
      "Material": "Polyester Blend",
      "Length": "Knee Length",
      "Care": "Machine Wash",
      "Pattern": "Floral"
    }
  },
  {
    name: "Running Shoes",
    description: "Professional running shoes with advanced cushioning technology.",
    price: 4999,
    originalPrice: 6999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 100,
    rating: 4.7,
    reviewCount: 200,
    fastDelivery: false,
    features: ["Lightweight", "Breathable", "Durable", "Shock Absorbent"],
    specifications: {
      "Material": "Mesh & Rubber",
      "Weight": "280g",
      "Sole": "Air Cushion",
      "Closure": "Lace-up"
    }
  },
  {
    name: "Leather Jacket",
    description: "Premium genuine leather jacket for men with classic design.",
    price: 7999,
    originalPrice: 11999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 30,
    rating: 4.6,
    reviewCount: 85,
    fastDelivery: true,
    features: ["Genuine Leather", "Classic Design", "Warm Lining", "Multiple Pockets"],
    specifications: {
      "Material": "Genuine Leather",
      "Lining": "Polyester",
      "Closure": "Zipper",
      "Color": "Black"
    }
  },

  // Books (6 products)
  {
    name: "The Psychology of Money",
    description: "Timeless lessons on wealth, greed, and happiness by Morgan Housel.",
    price: 399,
    originalPrice: 599,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 200,
    rating: 4.8,
    reviewCount: 350,
    fastDelivery: true,
    features: ["Personal Finance", "Wealth Building", "Psychology", "Investment"],
    specifications: {
      "Author": "Morgan Housel",
      "Pages": "256",
      "Language": "English",
      "Publisher": "Harriman House"
    }
  },
  {
    name: "Atomic Habits",
    description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones by James Clear.",
    price: 449,
    originalPrice: 699,
    category: "Books",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 180,
    rating: 4.9,
    reviewCount: 500,
    fastDelivery: true,
    features: ["Self-help", "Productivity", "Habit Formation", "Personal Growth"],
    specifications: {
      "Author": "James Clear",
      "Pages": "320",
      "Language": "English",
      "Publisher": "Avery"
    }
  },

  // Home Appliances (8 products)
  {
    name: "Coffee Maker",
    description: "Automatic coffee maker with programmable features and built-in grinder.",
    price: 8999,
    originalPrice: 11999,
    category: "Home Appliances",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 25,
    rating: 4.6,
    reviewCount: 95,
    fastDelivery: true,
    features: ["Programmable", "Built-in Grinder", "Thermal Carafe", "Auto Shut-off"],
    specifications: {
      "Capacity": "12 cups",
      "Grinder": "Built-in",
      "Carafe": "Thermal",
      "Programmable": "Yes"
    }
  },
  {
    name: "Desk Lamp",
    description: "LED desk lamp with adjustable brightness and color temperature.",
    price: 1499,
    originalPrice: 1999,
    category: "Home Appliances",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1530982785523-1f50a56b27f5?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 40,
    rating: 4.1,
    reviewCount: 65,
    fastDelivery: true,
    features: ["Adjustable Brightness", "Color Temperature", "USB Charging", "Flexible Arm"],
    specifications: {
      "LED Type": "COB",
      "Brightness": "800 lumens",
      "Color Temperature": "2700K-6500K",
      "Power": "USB"
    }
  },
  {
    name: "Air Purifier",
    description: "HEPA air purifier for clean and fresh indoor air quality.",
    price: 12999,
    originalPrice: 16999,
    category: "Home Appliances",
    image: "https://images.unsplash.com/photo-1587334984005-84fad2e4e7f7?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1587334984005-84fad2e4e7f7?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25856cd25?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 20,
    rating: 4.4,
    reviewCount: 110,
    fastDelivery: true,
    features: ["HEPA Filter", "Air Quality Sensor", "Quiet Operation", "Auto Mode"],
    specifications: {
      "Coverage": "500 sq ft",
      "Filter": "True HEPA",
      "Noise Level": "25 dB",
      "Power": "45W"
    }
  },

  // Sports (6 products)
  {
    name: "Yoga Mat",
    description: "Premium non-slip yoga mat with excellent cushioning.",
    price: 1999,
    originalPrice: 2999,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506629905607-e91e425e9560?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 60,
    rating: 4.4,
    reviewCount: 80,
    fastDelivery: false,
    features: ["Non-slip", "Eco-friendly", "Extra Thick", "Lightweight"],
    specifications: {
      "Material": "TPE",
      "Thickness": "6mm",
      "Size": "183cm x 61cm",
      "Weight": "1.2kg"
    }
  },
  {
    name: "Dumbbell Set",
    description: "Adjustable dumbbell set for home workouts and strength training.",
    price: 3999,
    originalPrice: 5999,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 35,
    rating: 4.3,
    reviewCount: 90,
    fastDelivery: false,
    features: ["Adjustable", "Non-slip Grip", "Durable", "Space Saving"],
    specifications: {
      "Weight Range": "5-25kg",
      "Material": "Cast Iron",
      "Grip": "Rubber",
      "Adjustment": "Quick Dial"
    }
  },
  {
    name: "Basketball",
    description: "Official size basketball for indoor and outdoor games.",
    price: 1299,
    originalPrice: 1999,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=500&auto=format&fit=crop"
    ],
    inStock: true,
    stockQuantity: 80,
    rating: 4.5,
    reviewCount: 120,
    fastDelivery: true,
    features: ["Official Size", "Durable", "Good Grip", "Indoor/Outdoor"],
    specifications: {
      "Size": "Official Size 7",
      "Material": "Rubber",
      "Weight": "600g",
      "Color": "Orange"
    }
  }
];

// Generate additional products to reach 40
const additionalProducts = [
  // More Electronics
  {
    name: "Smart TV 55-inch",
    description: "4K Ultra HD Smart TV with HDR and built-in streaming apps.",
    price: 45999,
    originalPrice: 59999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&auto=format&fit=crop",
    inStock: true,
    stockQuantity: 18,
    rating: 4.5,
    reviewCount: 180,
    fastDelivery: true,
    features: ["4K UHD", "Smart TV", "HDR", "Voice Control"],
    specifications: {
      "Display": "55-inch 4K",
      "Smart Platform": "WebOS",
      "HDR": "Dolby Vision",
      "Ports": "4 HDMI, 2 USB"
    }
  },
  {
    name: "Gaming Console",
    description: "Next-gen gaming console with 4K gaming and ultra-fast SSD.",
    price: 39999,
    originalPrice: 49999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&auto=format&fit=crop",
    inStock: true,
    stockQuantity: 22,
    rating: 4.8,
    reviewCount: 250,
    fastDelivery: true,
    features: ["4K Gaming", "1TB SSD", "Ray Tracing", "Backward Compatible"],
    specifications: {
      "Storage": "1TB SSD",
      "Resolution": "4K 120fps",
      "CPU": "8-core Zen 2",
      "GPU": "RDNA 2"
    }
  },
  {
    name: "Fitness Tracker",
    description: "Advanced fitness tracker with heart rate monitoring and GPS.",
    price: 2999,
    originalPrice: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop",
    inStock: true,
    stockQuantity: 65,
    rating: 4.2,
    reviewCount: 140,
    fastDelivery: true,
    features: ["Heart Rate", "GPS", "Sleep Tracking", "Water Resistant"],
    specifications: {
      "Battery": "7 days",
      "Waterproof": "50m",
      "Display": "OLED",
      "Connectivity": "Bluetooth"
    }
  },

  // More Fashion
  {
    name: "Women's Handbag",
    description: "Elegant leather handbag with multiple compartments.",
    price: 3499,
    originalPrice: 4999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop",
    inStock: true,
    stockQuantity: 40,
    rating: 4.4,
    reviewCount: 95,
    fastDelivery: true,
    features: ["Genuine Leather", "Multiple Pockets", "Adjustable Strap", "Zipper Closure"],
    specifications: {
      "Material": "Genuine Leather",
      "Size": "Medium",
      "Closure": "Zipper",
      "Color": "Brown"
    }
  },
  {
    name: "Men's Sports Shoes",
    description: "Lightweight sports shoes for running and gym workouts.",
    price: 3599,
    originalPrice: 4999,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&auto=format&fit=crop",
    inStock: true,
    stockQuantity: 85,
    rating: 4.3,
    reviewCount: 160,
    fastDelivery: true,
    features: ["Lightweight", "Breathable", "Flexible", "Durable"],
    specifications: {
      "Material": "Mesh & Rubber",
      "Weight": "280g",
      "Sole": "Air Cushion",
      "Closure": "Lace-up"
    }
  },

  // More Books
  {
    name: "Deep Work",
    description: "Rules for Focused Success in a Distracted World by Cal Newport.",
    price: 399,
    originalPrice: 599,
    category: "Books",
    image: "https://images.unsplash.com/photo-1558901357-ca41e027e43a?w=500&auto=format&fit=crop",
    inStock: true,
    stockQuantity: 120,
    rating: 4.6,
    reviewCount: 200,
    fastDelivery: true,
    features: ["Productivity", "Focus", "Work Habits", "Professional Growth"],
    specifications: {
      "Author": "Cal Newport",
      "Pages": "304",
      "Language": "English",
      "Publisher": "Grand Central"
    }
  },
  {
    name: "Thinking, Fast and Slow",
    description: "By Nobel Prize winner Daniel Kahneman about two systems that drive thinking.",
    price: 499,
    originalPrice: 799,
    category: "Books",
    image: "https://images.unsplash.com/photo-1551029506-0807df4e2031?w=500&auto=format&fit=crop",
    inStock: true,
    stockQuantity: 90,
    rating: 4.7,
    reviewCount: 180,
    fastDelivery: true,
    features: ["Psychology", "Decision Making", "Behavioral Economics", "Cognitive Science"],
    specifications: {
      "Author": "Daniel Kahneman",
      "Pages": "499",
      "Language": "English",
      "Publisher": "Farrar, Straus and Giroux"
    }
  },

  // More Home Appliances
  {
    name: "Microwave Oven",
    description: "Compact microwave oven with multiple cooking modes.",
    price: 5999,
    originalPrice: 8999,
    category: "Home Appliances",
    image: "https://images.unsplash.com/photo-1610057099443-648a8bb82a82?w=500&auto=format&fit=crop",
    inStock: true,
    stockQuantity: 35,
    rating: 4.2,
    reviewCount: 130,
    fastDelivery: true,
    features: ["Multiple Modes", "Digital Display", "Child Lock", "Auto Cook"],
    specifications: {
      "Capacity": "20L",
      "Power": "800W",
      "Control": "Digital",
      "Features": "Grill & Convection"
    }
  },
  {
    name: "Vacuum Cleaner",
    description: "Bagless vacuum cleaner with HEPA filtration and multiple attachments.",
    price: 7999,
    originalPrice: 11999,
    category: "Home Appliances",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500&auto=format&fit=crop",
    inStock: true,
    stockQuantity: 28,
    rating: 4.4,
    reviewCount: 95,
    fastDelivery: true,
    features: ["Bagless", "HEPA Filter", "Multiple Attachments", "Cordless"],
    specifications: {
      "Type": "Stick Vacuum",
      "Battery": "60 minutes",
      "Dustbin": "0.6L",
      "Filtration": "HEPA"
    }
  },

  // More Sports
  {
    name: "Tennis Racket",
    description: "Professional tennis racket with carbon fiber construction.",
    price: 5999,
    originalPrice: 8999,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&auto=format&fit=crop",
    inStock: true,
    stockQuantity: 45,
    rating: 4.5,
    reviewCount: 75,
    fastDelivery: false,
    features: ["Carbon Fiber", "Lightweight", "Powerful", "Comfort Grip"],
    specifications: {
      "Material": "Carbon Fiber",
      "Weight": "300g",
      "Grip Size": "4 3/8",
      "String Pattern": "16x19"
    }
  },
  {
    name: "Camping Tent",
    description: "4-person camping tent with waterproof design and easy setup.",
    price: 8999,
    originalPrice: 12999,
    category: "Sports",
    image: "https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?w=500&auto=format&fit=crop",
    inStock: true,
    stockQuantity: 25,
    rating: 4.3,
    reviewCount: 60,
    fastDelivery: false,
    features: ["4-person", "Waterproof", "Easy Setup", "Ventilation"],
    specifications: {
      "Capacity": "4 people",
      "Weight": "4.5kg",
      "Waterproof": "3000mm",
      "Setup Time": "10 minutes"
    }
  }
];

// Combine all products
const allProducts = [...sampleProducts, ...additionalProducts];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert all products
    await Product.insertMany(allProducts);
    console.log('All products inserted successfully');

    // Display inserted products count by category
    const products = await Product.find();
    const categoryCount = {};
    products.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
    });

    console.log(`\n📊 Total products in database: ${products.length}`);
    console.log('📈 Products by category:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} products`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();