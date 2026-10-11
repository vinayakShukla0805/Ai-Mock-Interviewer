import "dotenv/config";
import app from "./app.js"
import connectDB from "./config/db.js";
const PORT = process.env.PORT || 5000;

connectDB();

async function startServer() {
    try {
        app.listen(PORT, () => {
            console.log(`Mock Interviewer server running on port ${PORT}`);
            console.log(`http://localhost:8000/`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
}
startServer();
