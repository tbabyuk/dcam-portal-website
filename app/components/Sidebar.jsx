"use client"

import {HiOutlineDocumentText} from "react-icons/hi"
import { BsCheckCircleFill } from "react-icons/bs"
import { MdSchool } from "react-icons/md";
import { LuLayoutDashboard, LuCalendarCheck } from "react-icons/lu";
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTrainingVideosData } from "../context/TrainingVideosContext";


const routes = [
    {
        label: "Dashboard",
        icon: <LuLayoutDashboard size="1.2rem" />,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Availability",
        icon: <LuCalendarCheck size="1.2rem" />,
        href: "/availability",
        color: "text-purple-600"
    },
    {
        label: "Training",
        icon: <MdSchool size="1.3rem" />,
        href: "/training",
        color: "text-amber-600"
    },
    {
        label: "Documents",
        icon: <HiOutlineDocumentText size="1.2rem" />,
        href: "/documents",
        color: "text-emerald-500"
    }
]



export const Sidebar = ({setIsDrawerOpen}) => {

    const path = usePathname();
    const [numUnwatchedVideos, setNumUnwatchedVideos] = useState(0)
    const {assignedTrainingVideos, teacherTrainingVideosData} = useTrainingVideosData()


    const handleLinkClick = () => {
        if(setIsDrawerOpen) {
            setIsDrawerOpen(false)
        } else {
            return;
        }
    }


    const getNumUnwatchedTrainingVideos = () => {
        if (!teacherTrainingVideosData || typeof teacherTrainingVideosData !== "object") {
            setNumUnwatchedVideos(assignedTrainingVideos.length);
            return;
        }
        const numOfAssignedVideos = assignedTrainingVideos.length;
        console.log("logging numOfAssignedVideos", numOfAssignedVideos)
        const numOfWatchedVideos = Object.values(teacherTrainingVideosData).filter(vid => vid === true).length;

        console.log("Logging num of watched videos:", numOfWatchedVideos)
        setNumUnwatchedVideos(numOfAssignedVideos - numOfWatchedVideos);
    }


    // useEffect(() => {
    //     getNumUnwatchedTrainingVideos()
    // }, [assignedTrainingVideos, teacherTrainingVideosData])


    return (
        <div className="space-y-4 w-[200px] py-4 flex flex-col h-full bg-[#111827] text-gray-100">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-2">
                        <Image
                            fill
                            alt="logo"
                            src="/dcam-logo-white.png"
                        />
                    </div>
                    <span className="">
                        Teacher Portal
                    </span>
                </Link>
                <ul className="space-y-1">
                    {routes.map((route) => (
                        <li key={route.href} onClick={handleLinkClick}>
                            <Link href={route.href} className={`flex items-center flex-1 text-sm group p-3 2-full justify-start font-medium cursor-pointer hover:text-gray-100 hover:bg-white/10 rounded-lg transition ${path === route.href && "text-gray-100 bg-white/10"}`}>
                                <span className={`h-5 w-5 mr-3 ${route.color}`}>{route.icon}</span>
                                {route.label}{route.label === "Training" && numUnwatchedVideos > 0 ? (<span className="ms-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">{numUnwatchedVideos}</span>) : route.label === "Training" && numUnwatchedVideos === 0 ? (<BsCheckCircleFill className="ms-1 h-4 w-4 text-green-500" />) : ""}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
