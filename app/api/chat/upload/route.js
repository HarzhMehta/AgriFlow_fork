import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, rm } from 'fs/promises';
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import path from 'path';
import { getAuth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI for vision (same as utils.js)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const visionModel = process.env.GOOGLE_API_KEY 
    ? genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" }) 
    : null;

// Process images using Gemini Vision (matching utils.js implementation)
async function processImageWithGemini(filePath) {
    // Check if Gemini API is available
    if (!visionModel || !process.env.GOOGLE_API_KEY) {
        console.warn('Gemini API key not configured, skipping image processing');
        return `[Image: ${path.basename(filePath)} - Gemini Vision not configured]`;
    }
    
    try {
        // Read image as base64
        const imageBuffer = readFileSync(filePath);
        const base64Image = imageBuffer.toString('base64');
        
        // Use the format from utils.js that works
        const result = await visionModel.generateContent([
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/jpeg"
                }
            },
            { text: "Extract each and every information you can extract from the image" }
        ]);
        
        const geminiText = result.response.text();
        return geminiText;
    } catch (error) {
        console.error(`Gemini Vision error for ${filePath}:`, error);
        return `[Image: ${path.basename(filePath)} - Could not process with Vision AI]`;
    }
}

// Text extraction with image support
async function extractTextFromFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    try {
        // Text and markdown files
        if (['.txt', '.md'].includes(ext)) {
            return readFileSync(filePath, 'utf-8');
        }
        
        // Image files - use Gemini Vision
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
            return await processImageWithGemini(filePath);
        }
        
        // For other file types, return a placeholder
        return `[Content from ${path.basename(filePath)} - ${ext} file]`;
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return '';
    }
}

// Simplified document loader
async function loadDocumentsFromDirectory(directoryPath) {
    const documents = [];
    
    try {
        const files = readdirSync(directoryPath);
        
        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const stat = statSync(filePath);
            
            if (!stat.isDirectory()) {
                const content = await extractTextFromFile(filePath);
                if (content.trim()) {
                    documents.push({
                        pageContent: content,
                        metadata: { source: filePath }
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading documents:', error);
    }
    
    return documents;
}

export async function POST(req) {
    try {
        const { userId } = getAuth(req);
        
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await req.formData();
        const files = formData.getAll('files');

        if (!files || files.length === 0) {
            return NextResponse.json(
                { success: false, message: 'No files uploaded' },
                { status: 400 }
            );
        }

        // Create user directory
        const userDir = path.join(process.cwd(), 'Documents', userId);
        if (!existsSync(userDir)) {
            await mkdir(userDir, { recursive: true });
        }

        const uploadedFiles = [];
        let extractedDocumentData = '';

        // Save files temporarily
        for (const file of files) {
            if (file.size === 0) continue;

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Generate unique filename
            const timestamp = Date.now();
            const fileName = `${timestamp}_${file.name}`;
            const filePath = path.join(userDir, fileName);

            // Save file temporarily
            await writeFile(filePath, buffer);
            
            uploadedFiles.push({
                originalName: file.name,
                fileName: fileName,
                path: filePath,
                size: file.size,
                type: file.type
            });
        }

        // Extract text from documents (simplified, no heavy dependencies)
        try {
            const documents = await loadDocumentsFromDirectory(userDir);
            
            // Combine all extracted content
            if (documents.length > 0) {
                extractedDocumentData = documents
                    .map(doc => `--- Content from ${path.basename(doc.metadata.source)} ---\n${doc.pageContent}`)
                    .join('\n\n');
            }
        } catch (err) {
            console.error('Document loading error:', err.message);
            // Continue even if extraction fails
        }

        // Delete the entire user directory after extraction
        try {
            await rm(userDir, { recursive: true, force: true });
        } catch (err) {
            console.error('Directory deletion error:', err.message);
        }

        return NextResponse.json({
            success: true,
            message: `${uploadedFiles.length} file(s) processed successfully`,
            files: uploadedFiles,
            documentData: extractedDocumentData.trim()
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
}