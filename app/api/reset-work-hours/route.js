import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { connectToStaffDB } from "@/db/database"
import { Meta } from "@/models/models"

// First Friday when the reset runs (Feb 20). Every other Friday after this.
const ANCHOR_FRIDAY = new Date("2026-02-20T12:00:00.000Z")

function getEstWeekday() {
  return new Date().toLocaleDateString("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
  })
}

function getEstDateString() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  })
}

/** Returns true if today (EST) is a Friday that is exactly 0, 14, 28, ... days after ANCHOR_FRIDAY. */
function isRunFridayEST() {
  if (getEstWeekday() !== "Friday") return false

  const todayStr = getEstDateString()
  const thisFriday = new Date(todayStr + "T12:00:00.000Z")
  const diffMs = thisFriday.getTime() - ANCHOR_FRIDAY.getTime()
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000))

  if (diffDays < 0) return false
  return diffDays % 14 === 0
}

export const GET = async (request) => {
  // Only Vercel cron sends CRON_SECRET; reject all other callers (deploys, manual hits, bots).
  const secret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  if (!isRunFridayEST()) {
    return NextResponse.json(
      {
        message: "Skipped: not an every-other-Friday run day (EST).",
        estDate: getEstDateString(),
      },
      { status: 200 }
    )
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "terry@strictlywebdev.com",
      pass: process.env.STRICTLY_EMAIL_APP_PASS,
    },
  })

  const mailOptions = {
    from: "terry@strictlywebdev.com",
    to: ["terry@dacapomusic.ca"],
    subject: "Cron Job Ran – Teacher Pay Period Reset",
    html: `
      <strong>Vercel cron job has run:</strong><br />
      <small>Teacher submission and pay fields have been reset (every-other Friday EST).</small>
    `,
  }

  try {
    await connectToStaffDB()

    await Meta.updateMany(
      { teacher: { $nin: ["demo1", "demo2", "demo3", "demo4", "demo5"] } },
      {
        $set: {
          week1Submitted: false,
          week2Submitted: false,
          totalPay: 0,
          week1Notes: "",
          week2Notes: "",
          week1Total: 0,
          week2Total: 0,
        },
      }
    )

    await transporter.sendMail(mailOptions)

    return NextResponse.json(
      {
        message: "Meta reset completed and email sent.",
        estDate: getEstDateString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Reset work hours error:", error)
    return NextResponse.json(
      { message: "Failed to reset Meta or send email" },
      { status: 500 }
    )
  }
}
