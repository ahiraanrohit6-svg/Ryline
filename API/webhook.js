// api/webhook.js (Vercel Serverless Backend for Zapupi)

export default async function handler(req, res) {
    // Zapupi payment status ke liye POST request bhejta hai
    if (req.method === 'POST') {
        const data = req.body;

        // Agar user ka payment SUCCESS ho gaya hai tabhi aage badhein
        if (data.status === 'SUCCESS') {
            const amountPaid = parseFloat(data.amount);
            const userUid = data.order_id; // Frontend se aane wala orderId (UID)

            // 🔥 Aapki Firebase Details (Secret Key integrated) 🔥
            const firebaseUrl = "https://aviator-indian-default-rtdb.firebaseio.com";
            const firebaseSecret = "3m1FqfJe0m0l4HuWF5Febjeqo0oGoeZrwXb54Wsd"; 

            const balanceUrl = `${firebaseUrl}/users/${userUid}/rechargeWallet.json?auth=${firebaseSecret}`;

            try {
                // 1. Firebase se user ka purana recharge balance check karna
                const getResponse = await fetch(balanceUrl);
                let currentBalance = await getResponse.json();
                
                // Agar pehle se balance nahi hai to 0 maan lo
                if (currentBalance === null) currentBalance = 0;

                // 2. Naya balance jodna
                const newBalance = parseFloat(currentBalance) + amountPaid;

                // 3. Firebase Database mein naya balance update karna
                await fetch(balanceUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newBalance)
                });

                return res.status(200).send("Balance Updated Successfully in Firebase!");
            } catch (error) {
                return res.status(500).send("Firebase Update Error: " + error.message);
            }
        } else {
            return res.status(400).send("Payment was not SUCCESS");
        }
    } else {
        return res.status(405).send("Only POST method allowed");
    }
}
