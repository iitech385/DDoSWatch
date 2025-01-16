import axiosInstance from './axios';

export const fetchData = async () => {
    try {
        const response = await axiosInstance.get('/your-endpoint/');
        if (!response.data) {
            throw new Error('No data received');
        }
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}; 