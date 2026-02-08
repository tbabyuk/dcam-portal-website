"use client"

import { BsCheckCircle, BsXCircle, BsCircle } from "react-icons/bs"
import { useState } from "react"



export const StudentRow = ({student, index, setAttendance, setTotal, payday}) => {

  const [attendanceStatus, setAttendanceStatus] = useState("")
  const [attendanceSelected, setAttendanceSelected] = useState(false)


  const handleSelect = (e) => {

    const value = e.target.value

    // Logic for displaying accumulated pay based on attendance value
    if(!attendanceSelected && (value === "present" || value === "counted")) {
      setAttendanceSelected(true)
      setTotal((prev) => prev + student.pay)
    }
    if(attendanceSelected && value === "absent") {
      setAttendanceSelected(false)
      setTotal((prev) => prev - student.pay)
    }
    if(!attendanceSelected && value === "absent") {
      setTotal((prev) => prev - 0)
    }

    // Used to display correct attendance icon to user
    setAttendanceStatus(e.target.value)

    // Update attendance for this student (replace existing entry if they changed selection)
    const record = {
      enrollment_id: student.id,
      student_id: student.student_id,
      student_name: student.student_name,
      teacher_id: student.teacher_id,
      teacher_name: student.teacher_name,
      status: value,
      duration: student.duration,
      pay: student.pay,
      payday: payday
    }
    setAttendance((prev) => {
      const withoutThisStudent = prev.filter((r) => r.enrollment_id !== student.id)
      return [...withoutThisStudent, record]
    })
  }

  

  const setIcon = () => {
    if(attendanceStatus === "present") {
        return <BsCheckCircle size="1.1rem" color="green" className="mx-auto" />
    } else if (attendanceStatus === "absent") {
        return <BsXCircle size="1.1rem" color="red" className="mx-auto" />
    } else if (attendanceStatus === "counted") {
        return <BsCheckCircle size="1.1rem" color="orange" className="mx-auto" />
    } else {
        return <BsCircle size="1.1rem" className="mx-auto" />
    }
  }
    

  return (
    <tr className="text-center bg-gray-100 h-6 even:bg-gray-200">
        <td className="py-2.5 px-3 hidden md:block">{index + 1}</td>
        <td className="py-2.5 px-3 text-left">{student.student_name}</td>
        <td className="py-2.5">
            <select defaultValue={"attendance"} onChange={(e) => handleSelect(e)} className="cursor-pointer px-2 py-1 border rounded-md">
                <option value="attendance" disabled>attendance</option>
                <option value="present">present</option>
                <option value="absent">absent</option>
                <option value="counted">absent (late)</option>
            </select>
        </td>
        <td className="py-2.5 px-3 hidden md:block">{student.duration}</td>
        <td>{setIcon()}</td>
    </tr>
  )
}