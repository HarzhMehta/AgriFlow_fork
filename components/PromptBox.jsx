import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import Image from 'next/image'
import React, { useState, useRef } from 'react'
import toast from 'react-hot-toast';

const PromptBox = ({setIsLoading, isLoading, isAnimatingRef}) => {

    const [prompt, setPrompt] = useState('');
    const [pendingFiles, setPendingFiles] = useState([]); // Changed from uploadedFiles
    const [searchSelected, setSearchSelected] = useState(false);
    const [deepThinkSelected, setDeepThinkSelected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const fileInputRef = useRef(null);
    const fullMessageRef = useRef('');
    const stopAnimationRef = useRef(false);
    const {user, chats, setChats, selectedChat, setSelectedChat} = useAppContext();

    const handleKeyDown = (e)=>{
        if(e.key === "Enter" && !e.shiftKey){
            e.preventDefault();
            sendPrompt(e);
        }
    }

    const handleFileUpload = () => {
        if (!user) return toast.error('Login to upload files');
        if (pendingFiles.length >= 4) return toast.error('Maximum 4 files allowed');
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // Check file limit
        if (pendingFiles.length + files.length > 4) {
            toast.error('Maximum 4 files allowed');
            return;
        }

        // Just add to pending files (don't upload yet)
        const newFiles = files.map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file // Store the actual file object
        }));
        
        setPendingFiles(prev => [...prev, ...newFiles]);
        toast.success(`${files.length} file(s) selected`);
        
        // Reset file input
        e.target.value = '';
    };

    const removeFile = (fileId) => {
        setPendingFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const uploadFilesToServer = async (files) => {
        if (files.length === 0) return [];

        try {
            const formData = new FormData();
            
            files.forEach((fileData) => {
                formData.append('files', fileData.file);
            });
            
            formData.append('userId', user.id);

            const response = await axios.post('/api/chat/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                return {
                    files: response.data.files,
                    documentData: response.data.documentData || ''
                };
            } else {
                throw new Error(response.data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    };

    const getFileIcon = (type) => {
        if (type?.startsWith('image/')) return '🖼️';
        if (type?.includes('pdf')) return '📄';
        if (type?.includes('word') || type?.includes('document')) return '📝';
        if (type?.includes('text')) return '📋';
        return '📎';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const sendPrompt = async (e)=>{
        e.preventDefault();
        // Validate: Don't allow empty messages
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt && pendingFiles.length === 0) {
            toast.error('Please enter a message or upload a file');
            return;
        }
        if (!trimmedPrompt && pendingFiles.length > 0) {
            toast.error('Please add a message with your files');
            return;
        }
        const promptCopy = prompt;
        const pendingFilesCopy = [...pendingFiles];
        try {
            if(!user) return toast.error('Login to send message');
            if(isLoading) return toast.error('Wait for the previous prompt response');
            setIsLoading(true)
            setPrompt("")
            // Upload files to server when sending
            let uploadResponse = { files: [], documentData: '' };
            if (pendingFiles.length > 0) {
                uploadResponse = await uploadFilesToServer(pendingFiles);
            }
            // Extract just filenames for display
            const fileNames = uploadResponse.files.map(f => f.originalName || f.fileName || 'Unknown');
            const userPrompt = {
                role: "user",
                content: trimmedPrompt,
                timestamp: Date.now(),
                files: fileNames,
                hasFiles: fileNames.length > 0,
                documentData: uploadResponse.documentData
            }
            // Clear pending files after successful upload
            setPendingFiles([]);
            // Show user message optimistically in UI
            setSelectedChat((prev)=> ({
                ...prev,
                messages: [...(prev?.messages ?? []), userPrompt]
            }))
            // Only send searchSelected flag, let backend decide if web search is needed
            const {data} = await axios.post('/api/chat/ai', {
                chatId: selectedChat._id,
                prompt: trimmedPrompt,
                filesMeta: uploadResponse.files,
                documentData: uploadResponse.documentData,
                searchSelected,
                deepThinkSelected
            })
            if(data.success){
                setChats((prevChats)=>prevChats.map((chat)=>chat._id === selectedChat._id ? {...chat, messages: [...chat.messages, data.data]} : chat))
                const message = data.data.content;
                fullMessageRef.current = message;
                const messageTokens = message.split(" ");
                const baseAssistantMessage = {
                    role: 'assistant',
                    content: "",
                    timestamp: Date.now(),
                };
                setSelectedChat((prev) => ({
                    ...prev,
                    messages: [...prev.messages, baseAssistantMessage]
                }));
                let currentIndex = 0;
                stopAnimationRef.current = false;
                setIsTyping(true);
                if (isAnimatingRef) isAnimatingRef.current = true;
                function animateMessage() {
                    if (stopAnimationRef.current || currentIndex >= messageTokens.length) {
                        if (isAnimatingRef) isAnimatingRef.current = false;
                        setIsTyping(false);
                        // Always load the full message at the end
                        setSelectedChat(prev => {
                            const fullMessage = {
                                ...baseAssistantMessage,
                                content: fullMessageRef.current,
                            };
                            const updatedMessages = [
                                ...prev.messages.slice(0, -1),
                                fullMessage
                            ];
                            return { ...prev, messages: updatedMessages };
                        });
                        return;
                    }
                    // Reveal 8 words per interval for much faster output
                    const revealCount = 8;
                    setSelectedChat(prev => {
                        const updatedMessage = {
                            ...baseAssistantMessage,
                            content: messageTokens.slice(0, currentIndex).join(" "),
                        };
                        const updatedMessages = [
                            ...prev.messages.slice(0, -1),
                            updatedMessage
                        ];
                        return { ...prev, messages: updatedMessages };
                    });
                    currentIndex += revealCount;
                    if (currentIndex < messageTokens.length) {
                        setTimeout(animateMessage, 5);
                    } else {
                        // Animation complete, trigger final update
                        setTimeout(animateMessage, 5);
                    }
                }
                animateMessage();
            }else{
                toast.error(data.message);
                setPrompt(promptCopy);
                setPendingFiles(pendingFilesCopy); // Restore files if message failed
            }
        } catch (error) {
            toast.error(error.message);
            setPrompt(promptCopy);
            setPendingFiles(pendingFilesCopy); // Restore files if upload failed
        } finally {
            setIsLoading(false);
        }
    }

    const handleStop = () => {
        stopAnimationRef.current = true;
    }

  return (
    <form onSubmit={sendPrompt}
     className={`w-full ${selectedChat?.messages.length > 0 ? "max-w-3xl" : "max-w-2xl"} bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}>
        
        {/* Hidden file input */}
        <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.gif"
            onChange={handleFileChange}
            style={{ display: 'none' }}
        />

        {/* Show pending files */}
        {pendingFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
                {pendingFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 bg-gray-600/50 px-3 py-2 rounded-lg text-sm border border-yellow-500/30">
                        <span className="text-lg">{getFileIcon(file.type)}</span>
                        <div className="flex flex-col">
                            <span className="text-white text-xs font-medium truncate max-w-[120px]">
                                {file.name}
                            </span>
                            <span className="text-gray-400 text-xs">
                                {formatFileSize(file.size)}
                            </span>
                        </div>
                        <span className="text-yellow-400 text-xs">Pending</span>
                        <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="text-gray-400 hover:text-white transition-colors ml-1"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        )}

        <textarea
        onKeyDown={handleKeyDown}
        className={`outline-none w-full resize-none overflow-hidden break-words bg-transparent ${isLoading || isTyping ? 'opacity-50 cursor-not-allowed' : ''}`}
        rows={2}
        placeholder={isLoading || isTyping ? 'Please wait...' : 'Message NoBody'}
        required 
        disabled={isLoading || isTyping}
        onChange={(e)=> setPrompt(e.target.value)} value={prompt}/>

        <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-2'>
                <p
                    className={`flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full transition ${
                        isLoading || isTyping 
                            ? 'opacity-50 cursor-not-allowed' 
                            : deepThinkSelected 
                                ? 'bg-gray-700 text-white border-primary cursor-pointer' 
                                : 'hover:bg-gray-500/20 cursor-pointer'
                    }`}
                    onClick={() => {
                        if (!isLoading && !isTyping) setDeepThinkSelected((prev) => !prev);
                    }}
                >
                    <Image className='h-5' src={assets.deepthink_icon} alt=''/>
                    DeepThink (R1)
                    {deepThinkSelected && <span className="ml-1 text-primary font-bold">●</span>}
                </p>
                <p
                    className={`flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full transition ${
                        isLoading || isTyping 
                            ? 'opacity-50 cursor-not-allowed' 
                            : searchSelected 
                                ? 'bg-gray-700 text-white border-primary cursor-pointer' 
                                : 'hover:bg-gray-500/20 cursor-pointer'
                    }`}
                    onClick={() => {
                        if (!isLoading && !isTyping) setSearchSelected((prev) => !prev);
                    }}
                >
                    <Image className='h-5' src={assets.search_icon} alt=''/>
                    Search
                    {searchSelected && <span className="ml-1 text-primary font-bold">●</span>}
                </p>
            </div>

            <div className='flex items-center gap-2'>
                <div className="relative">
                    <Image 
                        className={`w-4 transition ${
                            isLoading || isTyping || pendingFiles.length >= 4
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'cursor-pointer hover:opacity-70'
                        }`}
                        src={assets.pin_icon} 
                        alt='Upload files'
                        onClick={() => {
                            if (!isLoading && !isTyping) handleFileUpload();
                        }}
                    />
                    {pendingFiles.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {pendingFiles.length}
                        </span>
                    )}
                </div>
                {isTyping && (
                    <button 
                        type="button"
                        onClick={handleStop}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full transition"
                    >
                        Stop
                    </button>
                )}
                <button 
                    type="submit"
                    disabled={isLoading || isTyping}
                    className={`${
                        isLoading || isTyping
                            ? "bg-[#71717a] cursor-not-allowed opacity-50"
                            : prompt 
                                ? "bg-primary cursor-pointer" 
                                : "bg-[#71717a] cursor-pointer"
                    } rounded-full p-2 transition`}
                >
                    <Image className='w-3.5 aspect-square' src={prompt && !isLoading && !isTyping ? assets.arrow_icon : assets.arrow_icon_dull} alt=''/>
                </button>
            </div>
        </div>
    </form>
  )
}

export default PromptBox