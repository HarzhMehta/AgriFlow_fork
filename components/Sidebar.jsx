import { assets } from '@/assets/assets'
import Image from 'next/image'
import React, { useState } from 'react'
import { useClerk, UserButton } from '@clerk/nextjs'
import { useAppContext } from '@/context/AppContext'
import ChatLabel from './ChatLabel'
import { useRouter } from 'next/navigation'

const Sidebar = ({expand, setExpand}) => {

    const router = useRouter()
    const {openSignIn} = useClerk()
    const {user, chats, createNewChat} = useAppContext()
    const [openMenu, setOpenMenu] = useState({id: 0, open: false})

    return (
        <div
            className={`flex flex-col justify-between bg-[#212327] pt-6 pb-4 transition-all duration-300 ease-in-out z-50 max-md:absolute max-md:top-0 max-md:left-0 max-md:h-screen ${
                expand
                    ? 'w-64 px-4 max-md:w-64 max-md:opacity-100 max-md:pointer-events-auto'
                    : 'w-16 px-2 max-md:w-0 max-md:px-0 max-md:opacity-0 max-md:pointer-events-none'
            }`}
        >
            <div className="flex flex-col gap-4">
                <div className={`flex items-center ${expand ? 'justify-between' : 'justify-center'}`}>
                    {expand && <span className="sidebar-text text-lg font-semibold text-white">Chats</span>}
                    <div
                        onClick={() => (expand ? setExpand(false) : setExpand(true))}
                        className={`sidebar-icon-btn group relative flex items-center justify-center hover:bg-gray-500/20 transition-all duration-300 h-9 w-9 aspect-square rounded-lg cursor-pointer ${!expand && 'mx-auto'}`}
                    >
                        <Image src={assets.menu_icon} alt="" className="md:hidden sidebar-icon" />
                        <Image
                            src={expand ? assets.sidebar_close_icon : assets.sidebar_icon}
                            alt=""
                            className="hidden md:block w-7 sidebar-icon"
                        />
                        <div
                            className={`absolute w-max ${expand ? 'left-1/2 -translate-x-1/2 top-12' : '-top-12 left-0'} opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none z-[100]`}
                        >
                            <span className="sidebar-tooltip-text">{expand ? 'Close sidebar' : 'Open sidebar'}</span>
                            <div
                                className={`w-3 h-3 absolute bg-black rotate-45 ${expand ? 'left-1/2 -top-1.5 -translate-x-1/2' : 'left-4 -bottom-1.5'}`}
                            ></div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={createNewChat}
                    className={`sidebar-item flex items-center cursor-pointer transition-all duration-300 ${
                        expand
                            ? 'bg-primary hover:opacity-90 rounded-2xl gap-2 p-2.5 w-full justify-start'
                            : 'group relative h-9 w-9 mx-auto hover:bg-gray-500/30 rounded-lg justify-center'
                    }`}
                >
                    <Image
                        className={`transition-all duration-300 flex-shrink-0 ${expand ? 'w-6' : 'w-7'}`}
                        src={expand ? assets.chat_icon : assets.chat_icon_dull}
                        alt=""
                    />
                    <div className="absolute w-max -top-12 -right-12 opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none z-[100]">
                        <span className="sidebar-tooltip-text">New chat</span>
                        <div className="w-3 h-3 absolute bg-black rotate-45 left-4 -bottom-1.5"></div>
                    </div>
                    {expand && <p className="sidebar-text text-white text font-medium whitespace-nowrap">New chat</p>}
                </button>

                {expand && (
                    <div className="text-sm">
                        <p className="my-1 sidebar-text text-white/50">Recents</p>
                        {chats.map((chat, index) => (
                            <ChatLabel
                                key={index}
                                name={chat.name}
                                id={chat._id}
                                openMenu={openMenu}
                                setOpenMenu={setOpenMenu}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3">
                {user && (
                    <div
                        onClick={() => router.push('/news')}
                        className={`sidebar-item flex items-center cursor-pointer group relative transition-all duration-300 ${
                            expand
                                ? 'gap-2 text-white/80 text-sm p-2.5 border border-white/20 rounded-lg hover:bg-white/10'
                                : 'h-10 w-10 mx-auto hover:bg-gray-500/30 rounded-lg justify-center'
                        }`}
                    >
                        <span className={expand ? 'text-xl' : 'text-2xl'}>📰</span>
                        <div
                            className={`absolute w-max ${!expand && '-right-28'} -top-12 opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none z-[100]`}
                        >
                            <span className="sidebar-tooltip-text">News & Articles</span>
                            <div className={`w-3 h-3 absolute bg-black rotate-45 ${expand ? 'right-1/2' : 'left-4'} -bottom-1.5`}></div>
                        </div>
                        {expand && <span className="sidebar-text">News & Articles</span>}
                    </div>
                )}

                {user && (
                    <div
                        onClick={() => router.push('/profile')}
                        className={`sidebar-item flex items-center cursor-pointer group relative transition-all duration-300 ${
                            expand
                                ? 'gap-2 text-white/80 text-sm p-2.5 border border-white/20 rounded-lg hover:bg-white/10'
                                : 'h-10 w-10 mx-auto hover:bg-gray-500/30 rounded-lg justify-center'
                        }`}
                    >
                        <Image
                            className={`transition-all duration-300 sidebar-icon ${expand ? 'w-5' : 'w-6'}`}
                            src={assets.profile_icon}
                            alt="Edit Profile"
                        />
                        <div
                            className={`absolute w-max ${!expand && '-right-28'} -top-12 opacity-0 group-hover:opacity-100 transition bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none z-[100]`}
                        >
                            <span className="sidebar-tooltip-text">Edit Profile</span>
                            <div className={`w-3 h-3 absolute bg-black rotate-45 ${expand ? 'right-1/2' : 'left-4'} -bottom-1.5`}></div>
                        </div>
                        {expand && <span className="sidebar-text">Edit Profile</span>}
                    </div>
                )}

                <div
                    className={`sidebar-item flex items-center cursor-pointer group relative transition-all duration-300 ${
                        expand
                            ? 'gap-2 text-white/80 text-sm p-2.5 border border-primary rounded-lg hover:bg-white/10 cursor-pointer w-full'
                            : 'h-10 w-10 mx-auto hover:bg-gray-500/30 rounded-lg justify-center'
                    }`}
                >
                    <Image
                        className={`transition-all duration-300 sidebar-icon ${expand ? 'w-5' : 'w-6.5 mx-auto'}`}
                        src={expand ? assets.phone_icon : assets.phone_icon_dull}
                        alt=""
                    />
                    <div
                        className={`absolute -top-60 pb-8 ${!expand && '-right-40'} opacity-0 group-hover:opacity-100 hidden group-hover:block transition z-[100]`}
                    >
                        <div className="relative w-max bg-black text-white text-sm p-3 rounded-lg shadow-lg">
                            <Image src={assets.qrcode} alt="" className="w-44" />
                            <p className="sidebar-tooltip-text">Scan Here 😏</p>
                            <div className={`w-3 h-3 absolute bg-black rotate-45 ${expand ? 'right-1/2' : 'left-4'} -bottom-1.5`}></div>
                        </div>
                    </div>
                    {expand && (
                        <>
                            <span className="sidebar-text">Get App</span>
                            <Image alt="" src={assets.new_icon} />
                        </>
                    )}
                </div>

                <div
                    onClick={user ? null : openSignIn}
                    className={`sidebar-item flex items-center transition-all duration-300 ${
                        expand ? 'hover:bg-white/10 rounded-lg gap-3 w-full' : 'justify-center w-full'
                    } text-white/60 text-sm p-2 cursor-pointer`}
                >
                    {user ? <UserButton /> : <Image src={assets.profile_icon} alt="" className="w-7 sidebar-icon" />}

                    {expand && <span className="sidebar-text">My Profile</span>}
                </div>
            </div>
        </div>
    )
}

export default Sidebar
