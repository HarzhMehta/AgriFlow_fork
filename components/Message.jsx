import { assets } from '@/assets/assets'
import Image from 'next/image'
import React, { useEffect, useRef } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Prism from 'prismjs'
import toast from 'react-hot-toast'

const Message = ({role, content, files = []}) => {
const messageRef = useRef(null)

useEffect(()=>{
if (messageRef.current && role === 'assistant') {
Prism.highlightAllUnder(messageRef.current)
}
}, [content, role])

const copyMessage = ()=>{
navigator.clipboard.writeText(content)
toast.success('Message copied to clipboard')
}

return (
<div className='flex flex-col items-center w-full max-w-3xl text-sm'>
<div className={`flex flex-col  w-full mb-8 ${role === 'user' && 'items-end'}`}>
<div className={`group relative flex max-w-2xl py-3 rounded-xl ${role === 'user' ? 'bg-[#414158] px-5' : 'gap-3'}`}>
<div className={`opacity-0 group-hover:opacity-100 absolute ${role === 'user' ? '-left-16 top-2.5' : 'left-9 -bottom-6'} transition-all`}>
<div className='flex items-center gap-2 opacity-70'>
{
role === 'user' ? (
    <>
    <Image onClick={copyMessage} src={assets.copy_icon} alt='' className='w-4 cursor-pointer'/>
    <Image src={assets.pencil_icon} alt='' className='w-4.5 cursor-pointer'/>
    </>
):(
    <>
    <Image onClick={copyMessage} src={assets.copy_icon} alt='' className='w-4.5 cursor-pointer'/>
    <Image src={assets.regenerate_icon} alt='' className='w-4 cursor-pointer'/>
    <Image src={assets.like_icon} alt='' className='w-4 cursor-pointer'/>
    <Image src={assets.dislike_icon} alt='' className='w-4 cursor-pointer'/>
    </>
)
}
</div>
</div>
{
role === 'user' ? 
(
<div className='flex flex-col gap-2 w-full'>
<span className='text-white/90 whitespace-pre-wrap'>{content}</span>
{/* Show attached files below user message */}
{files && files.length > 0 && (
<div className="flex flex-wrap gap-2">
{files.map((fileName, i) => (
    <div
        key={i}
        className="flex items-center gap-2 bg-gray-700 px-2 py-1 rounded text-xs"
        title={fileName}
    >
        <span>📎</span>
        <span className="truncate max-w-[120px]">{fileName}</span>
    </div>
))}
</div>
)}
</div>
)
:
(
<>
<Image src={assets.logo_icon} alt='' className='h-9 w-9 p-1 border border-white/15 rounded-full flex-shrink-0'/>
<div ref={messageRef} className='prose prose-invert prose-sm max-w-none w-full overflow-x-auto'>
<Markdown
remarkPlugins={[remarkGfm]}
components={{
// Handle code blocks with <pre>
pre({children}) {
    return <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto my-4">{children}</pre>
},
// Handle inline and block code
code({node, inline, className, children, ...props}) {
    const match = /language-(\w+)/.exec(className || '')
    return inline ? (
        <code className="bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
            {children}
        </code>
    ) : (
        <code className={`language-${match?.[1] || ''}`} {...props}>
            {children}
        </code>
    )
},
p: ({children, node}) => {
    // Check if paragraph contains only a code block
    if (node?.children?.[0]?.tagName === 'code') {
        return <>{children}</>
    }
    return <p className="mb-4 leading-7">{children}</p>
},
ul: ({children}) => <ul className="list-disc ml-4 mb-4 space-y-2">{children}</ul>,
ol: ({children}) => <ol className="list-decimal ml-4 mb-4 space-y-2">{children}</ol>,
li: ({children}) => <li className="leading-7">{children}</li>,
h1: ({children}) => <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>,
h2: ({children}) => <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>,
h3: ({children}) => <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>,
blockquote: ({children}) => (
    <blockquote className="border-l-4 border-gray-500 pl-4 italic my-4">
        {children}
    </blockquote>
),
a: ({children, href}) => (
    <a href={href} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
    </a>
),
table: ({children}) => (
    <div className="overflow-x-auto my-4 rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
            {children}
        </table>
    </div>
),
thead: ({children}) => (
    <thead className="bg-gray-800">
        {children}
    </thead>
),
tbody: ({children}) => (
    <tbody className="divide-y divide-gray-700 bg-gray-900">
        {children}
    </tbody>
),
th: ({children}) => (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
        {children}
    </th>
),
td: ({children}) => (
    <td className="px-4 py-3 text-sm">
        {children}
    </td>
),
}}
>
{content}
</Markdown>
</div>
</>
)
}
</div>
</div>
</div>
)
}

export default Message
