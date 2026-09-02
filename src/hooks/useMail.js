export const useMail = () => {
    const[status, setStatus] = useState("idle");
    const[error, setError] = useState(null);
    const sendMail = async (email, customerName, orderId) => {
        setStatus("sending");
        setError(null);
        try {
            const response = await fetch('/api/sendReceipt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, customerName, orderId }),
            });
            const data = await response.json();
            setStatus("success");
            return data;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email :', error);
            setError(error);
            throw error;
        }
    };

    return { sendMail, status, error };
}