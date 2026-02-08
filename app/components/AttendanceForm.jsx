"use client"

import { useState } from "react"
import { StudentRow } from "../components/StudentRow"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { usePayday } from "../hooks/usePayday"



export const AttendanceForm = ({students}) => {

   const path = usePathname()
   const {data: session} = useSession()
   const [attendance, setAttendance] = useState([])
   const [total, setTotal] = useState(0)
   const {closestPaydayUnformatted} = usePayday()
   const [teacherNotes, setTeacherNotes] = useState("")


// console.log("From attendance form, closestPaydayUnformatted:", closestPaydayUnformatted)

console.log("LOgging students from attendance form================", students)

   console.log("Logging attendance from attendance form++++++++++++++++++++++", attendance)
//  { 'Andrew E': 'present', 'Joshua M': 'present', 'Justin H': 'present', 'Lucas S': 'present', 'Noah S': 'present', 'Tyler S': 'present' }   

   const handleSubmitAttendance = async (e) => {
        e.preventDefault()
        console.log("submitting this attendance:", attendance)

        // send attendance data to API
        try {
            const res = await fetch("/api/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({attendance, teacher: session?.user.name.toLowerCase(), week: path === "/attendance/week1" ? "week1Submitted" : "week2Submitted", payday: closestPaydayUnformatted, teacherNotes, total  })
            })
            const {message} = await res.json()

            if(message === "success") {
                location.reload()
            }

            } catch (error) {
                console.log("Error with post request:", error)
            }
   }


  return (
    <form onSubmit={handleSubmitAttendance}>        
        <table className="mx-auto">
            <thead>
                <tr className="font-semibold text-gray-600 bg-gray-300 text-center">
                    <td className="py-2 px-3 sm:px-6 hidden md:block text-center">Count</td>
                    <td className="py-2 px-3 sm:px-6 text-center">Student</td>
                    <td className="py-2 px-3 sm:px-6 text-center">Attendance</td>
                    <td className="py-2 px-3 sm:px-6 hidden md:block text-center">Duration</td>
                    <td className="py-2 px-3 sm:px-6 text-center">Status</td>
                </tr>
            </thead>
            <tbody>
                {students && students.map((student, index) => (
                    <StudentRow key={index} student={student} index={index} setAttendance={setAttendance} setTotal={setTotal} payday={closestPaydayUnformatted} />
                ))}
            </tbody>
        </table>
        <p className="mt-4 text-center"><span className="font-semibold">Total: ${total?.toFixed(2)}</span></p>

        <textarea 
            className="mt-8 block mx-auto border-2 border-gray-300 w-full sm:w-[350px] md:w-[550px] p-3" cols="30" rows="6" placeholder="Enter any notes you may have about your student attendance, substitute work, etc."
            value={teacherNotes}
            onChange={(e) => setTeacherNotes(e.target.value)}
        />

        <button type="submit" className="submit-btn" disabled={!students?.length || attendance.length !== students.length}>Submit Attendance</button>
    </form>
  )
}