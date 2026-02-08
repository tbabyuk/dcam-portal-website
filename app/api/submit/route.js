import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// MongoDB imports (still needed for Meta updates / routing)
import { connectToStaffDB } from "@/db/database";
import { Meta } from "@/models/models";

// Map frontend status values to Supabase enum values
function mapStatusToEnum(status) {
    switch (status) {
        case 'present':
            return 'present'
        case 'absent':
            return 'absent_not_billable'
        case 'counted':
            return 'absent_billable'
        default:
            return 'unrecorded'
    }
}

export const POST = async (request) => {
    
    const {attendance, teacher, week, payday, teacherNotes, total} = await request.json()

    console.log("logging attendance from /submit API:", attendance)

    // MongoDB helper functions for Meta updates
    const getNotesKey = () => {
        if(week === "week1Submitted") {
            return "week1Notes"
        } else {
            return "week2Notes"
        }
    }

    const getWeekTotalKey = () => {
        if(week === "week1Submitted") {
            return "week1Total"
        } else {
            return "week2Total"
        }
    }

    // Determine which week columns to update
    const weekStatusColumn = week === "week1Submitted" ? "week_1_status" : "week_2_status"
    const weekNotesColumn = week === "week1Submitted" ? "week_1_notes" : "week_2_notes"
    const weekPayColumn = week === "week1Submitted" ? "week_1_pay" : "week_2_pay"

    try {
        // ============ SUPABASE LOGIC ============
        // Upsert attendance records to Supabase
        for (const record of attendance) {
            const mappedStatus = mapStatusToEnum(record.status)
            // Pay is only earned for present or counted (absent_billable); absent = 0
            const rowPay = (record.status === "present" || record.status === "counted")
                ? (record.pay ?? 0)
                : 0

            const { error } = await supabaseServer
                .from('portal_attendance')
                .upsert(
                    {
                        enrollment_id: record.enrollment_id,
                        student_id: record.student_id,
                        student_name: record.student_name,
                        teacher_id: record.teacher_id,
                        teacher_name: record.teacher_name,
                        payday: record.payday,
                        [weekStatusColumn]: mappedStatus,
                        [weekNotesColumn]: teacherNotes || null,
                        [weekPayColumn]: rowPay
                    },
                    { onConflict: 'enrollment_id' }
                )

            if (error) {
                console.error("Error upserting attendance record:", error)
                throw error
            }
        }

        console.log(`Successfully saved ${attendance.length} attendance records for ${weekStatusColumn}`)

        // ============ MONGODB META UPDATE (for routing) ============
        await connectToStaffDB();

        // Save weekly total, notes, and submission status to Meta
        await Meta.updateOne(
            {"teacher": teacher}, 
            {$set: {[week]: true, "payday": payday, [getNotesKey()]: teacherNotes, [getWeekTotalKey()]: total}}
        )

        // If week 2 is being submitted, calculate and save totalPay
        if (week === "week2Submitted") {
            // Fetch the current meta to get week1Total
            const meta = await Meta.findOne({"teacher": teacher})
            const week1Total = meta?.week1Total || 0
            const week2Total = total
            const totalPay = week1Total + week2Total

            await Meta.updateOne(
                {"teacher": teacher}, 
                {$set: {"totalPay": totalPay}}
            )
            
            console.log("Calculated totalPay:", totalPay, "(week1:", week1Total, "+ week2:", week2Total, ")")
        }

        return NextResponse.json({message: "success"}, {status: 200})

    } catch (error) {
        console.log("Error submitting attendance:", error)
        return NextResponse.json({message: "Failed to submit attendance"}, {status: 500})
    }
}

