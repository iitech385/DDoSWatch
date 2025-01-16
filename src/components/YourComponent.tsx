import { useState, useEffect } from 'react';
import { fetchData } from '../api/services';

const YourComponent = () => {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const result = await fetchData();
                if (result) {
                    setData(result);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data) return <div>No data available</div>;

    return (
        <div>
            {/* Only access properties if data exists */}
            {data.map((item: any) => (
                item?.id ? (  // Check if id exists
                    <div key={item.id}>
                        {/* Your content */}
                    </div>
                ) : null
            ))}
        </div>
    );
};

export default YourComponent; 