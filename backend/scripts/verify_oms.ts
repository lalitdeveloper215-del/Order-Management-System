import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
    console.log('🚀 Starting project verification tests...');

    try {
        // 1. Fetch products to get a valid product ID and current stock
        const productsRes = await axios.get(`${BASE_URL}/products?limit=1`);
        const product = productsRes.data.data.products[0];
        const productId = product.id;
        const initialStock = product.stock;

        console.log(`Initial status: Product ID ${productId}, Stock: ${initialStock}`);

        // 2. Test: Order > stock -> fail
        console.log('\n--- 🧪 TEST 1: Order > Stock ---');
        try {
            await axios.post(`${BASE_URL}/orders`, {
                items: [{ productId, quantity: initialStock + 1 }]
            });
            console.log('❌ FAIL: Order with quantity > stock should have failed.');
        } catch (error: any) {
            console.log('✅ PASS: Order failed as expected:', error.response?.data?.message);
        }

        // 3. Test: Concurrent orders -> no overselling
        console.log('\n--- 🧪 TEST 2: Concurrency Test ---');
        const orderQuantity = 5;
        const numConcurrentOrders = Math.floor(initialStock / orderQuantity) + 2; 
        console.log(`Attempting ${numConcurrentOrders} concurrent orders of ${orderQuantity} items each...`);

        const requests = [];
        for (let i = 0; i < numConcurrentOrders; i++) {
            requests.push(axios.post(`${BASE_URL}/orders`, {
                items: [{ productId, quantity: orderQuantity }]
            }).catch(e => e));
        }

        const results = await Promise.all(requests);
        const successes = results.filter(r => r.status === 201).length;
        const failures = results.filter(r => r.status !== 201).length;

        console.log(`Results: ${successes} successful, ${failures} failed.`);

        const afterProductsRes = await axios.get(`${BASE_URL}/products?limit=50`); // search all to find ours
        const updatedProduct = afterProductsRes.data.data.products.find((p: any) => p.id === productId);
        const finalStock = updatedProduct.stock;

        console.log(`Final stock: ${finalStock}`);
        
        const totalSold = successes * orderQuantity;
        if (initialStock - totalSold === finalStock && finalStock >= 0) {
            console.log('✅ PASS: Inventory is consistent and no overselling occurred.');
        } else {
            console.log('❌ FAIL: Inventory mismatch or overselling detected.');
        }

        // 4. Test: Pagination, Filtering, Sorting
        console.log('\n--- 🧪 TEST 3: Pagination & Filtering ---');
        const page1 = await axios.get(`${BASE_URL}/products?limit=5&page=1`);
        const page2 = await axios.get(`${BASE_URL}/products?limit=5&page=2`);
        
        if (page1.data.data.products[0].id !== page2.data.data.products[0].id) {
            console.log('✅ PASS: Pagination returns different results for different pages.');
        } else {
            console.log('❌ FAIL: Pagination results are identical.');
        }

        const filtered = await axios.get(`${BASE_URL}/products?search=${product.name.substring(0, 5)}`);
        if (filtered.data.data.products.length > 0) {
           console.log('✅ PASS: Search filter works.');
        } else {
           console.log('❌ FAIL: Search filter returned no results.');
        }

        console.log('\n--- ✨ VERIFICATION COMPLETE ---');

    } catch (error: any) {
        console.error('❌ Error during testing:', error.message);
    }
}

runTests();
