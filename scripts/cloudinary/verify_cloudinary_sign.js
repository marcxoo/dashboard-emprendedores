
const testSigning = async () => {
    try {
        const response = await fetch('http://localhost:3001/sign-cloudinary');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        console.log('✅ Signing Endpoint Protocol: OK');
        console.log('   - Cloud Name:', data.cloud_name ? 'Present' : 'MISSING');
        console.log('   - API Key:', data.api_key ? 'Present' : 'MISSING');
        console.log('   - Signature:', data.signature ? 'Present' : 'MISSING');
        console.log('   - Timestamp:', data.timestamp ? 'Present' : 'MISSING');

        if (data.cloud_name === 'dkm3tx8ez' && data.api_key === '159686974188228' && data.signature) {
            console.log('🎉 Verification PASSED: Credentials match and signature generated.');
        } else {
            console.error('❌ Verification FAILED: Data mismatch or missing fields.');
        }

    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
    }
};

testSigning();
