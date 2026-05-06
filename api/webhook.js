// api/webhook.js (Vercel Serverless Backend for Zapupi)
export default async function handler(req, res) {
    if (req.method === 'POST') {
        const data = req.body;
        
        // Status check: ZapUPI kuch bhi success status bheje, code accept kar lega
        const status = (data.status || "").toLowerCase();
        if (status === 'success' || status === 'paid' || status === 'txn_success' || status === 'completed') {
            const amountPaid = parseFloat(data.amount);
            
            // Order ID mein se UID nikalna
            const rawOrderId = data.order_id || ""; 
            const userUid = rawOrderId.split('_')[0]; 

            // 🔥 Aapki Firebase Details 🔥
            const firebaseUrl = "https://aviator-indian-default-rtdb.firebaseio.com";
            const firebaseSecret = "3m1FqfJe0m0l4HuWF5Febjeqo0oGoeZrwXb54Wsd"; 

            const balanceUrl = `${firebaseUrl}/users/${userUid}/rechargeWallet.json?auth=${firebaseSecret}`;

            try {
                const getResponse = await fetch(balanceUrl);
                let currentBalance = await getResponse.json();
                if (currentBalance === null) currentBalance = 0;

                const newBalance = parseFloat(currentBalance) + amountPaid;

                await fetch(balanceUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newBalance)
                });

                return res.status(200).send("Balance Updated Successfully!");
            } catch (error) {
                return res.status(500).send("Firebase Update Error: " + error.message);
            }
        } else {
            return res.status(400).send("Payment was not SUCCESS. Status received: " + data.status);
        }
    } else {
        return res.status(405).send("Only POST allowed");
    }
}
