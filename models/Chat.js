import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        messages: [
            {
                role: {type: String, required: true},
                content: {type: String, required: true},
                timestamp: {type: Number, required: true},
                hasFiles: {type: Boolean, default: false},
                files: [String],  // Simple array of filenames
                documentData: {type: String, default: ''}  // Extracted text from uploaded documents
            },
        ],
        userId: {type: String, required: true},
    },
    {timestamps: true}
);

const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema)

export default Chat;