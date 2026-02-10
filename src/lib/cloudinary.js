/**
 * Upload an image to Cloudinary using a secure signed flow.
 * Requires local_sync_server.js to be running on port 3001.
 * 
 * @param {File} file - The file object to upload
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadImage = async (file) => {
    try {
        // 1. Get signature from Vercel API
        const signResponse = await fetch('/api/sign-cloudinary');
        if (!signResponse.ok) throw new Error('Failed to get upload signature');

        const { signature, timestamp, cloud_name, api_key } = await signResponse.json();

        // 2. Prepare FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', api_key);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', 'dashboard_uploads');
        formData.append('source', 'uw'); // Upload Widget / User Upload source tracking

        // 3. Upload to Cloudinary
        const uploadResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await uploadResponse.json();
        return data.secure_url;

    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw error;
    }
};

/**
 * Upload a generic file (PDF, Doc, etc.) to Cloudinary.
 * Uses resource_type: 'auto' to handle non-image files.
 * 
 * @param {File} file - The file object to upload
 * @returns {Promise<string>} - The secure URL of the uploaded file
 */
export const uploadFile = async (file) => {
    try {
        // 1. Get signature
        const signResponse = await fetch('/api/sign-cloudinary');
        if (!signResponse.ok) throw new Error('Failed to get upload signature');

        const { signature, timestamp, cloud_name, api_key } = await signResponse.json();

        // 2. Prepare FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', api_key);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', 'dashboard_uploads');
        formData.append('source', 'uw');

        // 3. Upload to Cloudinary
        // For PDFs, use 'raw' to avoid implicit image transformation restrictions (401)
        const isPdf = file.type === 'application/pdf';
        const resourceType = isPdf ? 'raw' : 'auto';

        const uploadResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${cloud_name}/${resourceType}/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await uploadResponse.json();
        return data.secure_url;

    } catch (error) {
        console.error('Cloudinary File Upload Error:', error);
        throw error;
    }
};
