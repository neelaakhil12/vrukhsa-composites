import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products';

async function testBackend() {
    console.log('--- Starting Backend Stability Test ---');

    try {
        // 1. Create a product
        console.log('Step 1: Creating a new product...');
        const createRes = await axios.post(API_URL, {
            name: 'Test Nano Material',
            category: 'Additive NanoWorks',
            subCategory: 'Pure Nano Powder',
            description: 'A test material for backend verification.',
            price: 1500,
            originalPrice: 2000,
            seller: 'Vruksha Composites'
        });
        const newProductId = createRes.data.product_id || createRes.data.id;
        console.log(`✅ Success: Created product with ID ${newProductId}`);

        // 2. Update the product
        console.log('\nStep 2: Updating the product...');
        const updateRes = await axios.patch(`${API_URL}/${newProductId}`, {
            price: 1800,
            description: 'Updated test material description.'
        });
        console.log(`✅ Success: Updated price to ${updateRes.data.price}`);

        // 3. Delete (Soft Delete) the product
        console.log('\nStep 3: Deleting the product (Soft Delete)...');
        await axios.delete(`${API_URL}/${newProductId}`);
        console.log('✅ Success: Product soft-deleted');

        // 4. Verify deletion
        console.log('\nStep 4: Verifying deletion...');
        try {
            await axios.get(`${API_URL}/${newProductId}`);
            console.log('❌ Failure: Product should not be found');
        } catch (e: any) {
            if (e.response.status === 404) {
                console.log('✅ Success: Product correctly hidden after deletion');
            } else {
                throw e;
            }
        }

        // 5. Restore the product
        console.log('\nStep 5: Restoring the product...');
        await axios.post(`${API_URL}/${newProductId}/restore`);
        const restoreRes = await axios.get(`${API_URL}/${newProductId}`);
        console.log(`✅ Success: Product restored. Name: ${restoreRes.data.name}`);

        console.log('\n--- All Tests Passed: Backend is Stable & CRUD Ready ---');
    } catch (error: any) {
        console.error('❌ Test Failed:', error.response?.data || error.message);
    }
}

testBackend();
